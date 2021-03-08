using AMWUtil.PropertyFile;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using AWCSEngine.Worker;
using AMSModel.Constant.StringConst;
using AWCSEngine.Util;

namespace AWCSEngine
{
    static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            PropertyFileManager.GetInstant().AddPropertyFile(PropertyConst.APP_KEY, PropertyConst.APP_FILENAME);
            var appProperty = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY);

            AMWUtil.Logger.AMWLoggerManager.InitInstant(
                appProperty[PropertyConst.APP_KEY_LOG_ROOTPATH],
                appProperty[PropertyConst.APP_KEY_LOG_FILENAME]);


            ThreadMcRuntime.GetInstant().Initial();
            ThreadWorkRuntime.GetInstant().Initial();
            ThreadAPIFileRuntime.GetInstant().Initial();
            ThreadWakeUp.GetInitial().Initial();

            Application.SetHighDpiMode(HighDpiMode.SystemAware);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            //string souLoc = "001049001";
            //string desLoc = "003050001";
            //var routeTree = LocationUtil.GetLocationRouteTree(souLoc, null, new List<string>() { desLoc });
            Application.Run(new formConfigCommand());
            //Application.Run(new formConsole());
        }
    }
}
