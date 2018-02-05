using VueTest.Models;
using Microsoft.EntityFrameworkCore;

namespace VueTest.Context
{
    public class UserContext : DbContext
    {
        public UserContext(DbContextOptions<UserContext> options) : base(options)
        {

        }

        public DbSet<User> User { get; set; }
    }
}