var chat = {
    props: ['hubProxy', 'profile'],
    methods: {
        send: function () {
            var message = {
                name: this.profile.fName + ' ' + this.profile.lName,
                message: this.message,
                create_Dt: new Date(),
                isMe: true,
                type: 'text'
            };
            if (this.message !== '' && this.message !== null) {
                this.hubProxy.sendMessage(message);
                this.conversations[this.conversations.length - 1].chats.push(message);
                this.message = null;
                this.$refs.message.focus();
            }
            setTimeout(() => {
                this.scrollBottom(this.$refs.chatbox);
            }, 100);
        },
        scrollBottom: function(el) {
            el.scrollTop = el.scrollHeight;
        },
        onresize: function () {
            this.scrollBottom(this.$refs.chatbox);
        },
        enterPress: function() {
            this.send();
        }
    },
    data: function () {
        var data = {
            message: '',
            conversations: [],
            loading: false
        };
        return data;
    },
    created: function () {
        var self = this;
        self.convId = -1;

        self.loadChats = function() {
            self.loading = true;
            apiFactory.getChat(self.convId).then(function(response) {
                var conversation = response.data;
                self.convId = conversation.convId;
                self.conversations.splice(0, 0, conversation);
                conversation.chats.forEach((chat) => {
                    chat.isMe = chat.user_Id === "00000000-0000-0000-0000-000000000000";
                });
                self.loading = false;
            }).catch(function(error) {
                console.log('Could not get chats.');
                console.log(error);
                self.loading = false;
            });
        };

        self.registerEvent = function() {
            self.hubProxy.onNewMessage(self, function(message) {
                message.isMe = false;
                message.create_Dt = new Date();
                self.conversations[self.conversations.length - 1].chats.push(message);
                setTimeout(() => {
                    self.scrollBottom(self.$refs.chatbox);
                }, 100);
            });
        };

        (function() {
            self.loadChats();
            self.registerEvent();
        })();
    },
    mounted: function () {
        window.addEventListener('resize', this.onresize);
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.onresize);
    },
    destroyed: function() {
        this.$emit('destroy');
    }
};

register.getTemplate('../vuetest/component/chat.html', function (template) {
    chat.template = template;
    register.registerModule('chat', chat);
});