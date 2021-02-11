using AMWUtil.PropertyFile;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using AWCSEngine.Worker;
using AMSModel.Constant.StringConst;

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


            ThreadCoreWorker.GetInstant().Initial();
            ThreadWakeUpWorker.GetInitial().Initial();

            Application.SetHighDpiMode(HighDpiMode.SystemAware);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new formAdminConsole(new VOCriteria()));
        }
    }
}
