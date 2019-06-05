using System.Web;
using System.Web.Mvc;

namespace ProjectSTA_SAPConnect
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
