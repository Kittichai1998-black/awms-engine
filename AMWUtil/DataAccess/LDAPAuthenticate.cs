using System;
using System.Collections.Generic;
using System.Text;
using AMWUtil.Exception;
using AMWUtil.Logger;
using Novell.Directory.Ldap;

namespace AMWUtil.DataAccess
{
    public class LDAPAuthenticate
    {
        public static bool ValidateUser(string username, string password ,string serverName, string formatDN)
        {
            var spFormat = formatDN.Split(',');

            List<string> userDn = new List<string>();
            foreach (var id in spFormat)
            {
                var sp = id.Split('=');
                if (sp[1] != "")
                    userDn.Add(id);
                else
                {
                    userDn.Add($"{sp[0]}={username}");
                }
            }

            try
            {
                using (var connection = new LdapConnection { SecureSocketLayer = false })
                {
                    connection.Connect(serverName, LdapConnection.DEFAULT_PORT);
                    connection.Bind(string.Join(',', userDn.ToArray()), password);
                    if (connection.Bound)
                        return true;
                }
            }
            catch (LdapException ex)
            {
                //throw new System.Exception();
            }
            return false;
        }
    }
}
