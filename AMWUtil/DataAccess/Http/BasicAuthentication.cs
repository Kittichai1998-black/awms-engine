using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.DataAccess.Http
{
    public class BasicAuthentication : IAuthentication
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public BasicAuthentication(string username, string password)
        {
            this.Username = username;
            this.Password = password;
        }
    }
}
