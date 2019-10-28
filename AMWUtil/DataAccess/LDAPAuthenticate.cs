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
        public static bool ValidateUser(string binddn, string bindpw, string host, int? port, int? version, bool? starttls)
        {
            try
            {
                using (var connection = new LdapConnection { SecureSocketLayer = false })
                {
                    connection.Connect(host, port.Value);
                    if (starttls != null)
                    {
                        if(starttls.Value)
                            connection.StartTls();
                    }
                    if (version != null)
                    {
                        if(version == null)
                            connection.Bind(version.Value, binddn, bindpw);
                        else
                            connection.Bind(binddn, bindpw);
                    }
                    else
                    {
                        connection.Bind(binddn, bindpw);
                    }
                    if (connection.Bound)
                        return true;
                }
            }
            catch (LdapException ex)
            {
                throw ex;
                //throw new System.Exception();
            }
            return false;
        }
    }
}
