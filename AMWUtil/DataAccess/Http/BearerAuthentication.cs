using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.DataAccess.Http
{
   public  class BearerAuthentication : IAuthentication
    {
        public string Token { get; set; }
        public BearerAuthentication(string token)
        {
            this.Token = token;
        }
    }
}
