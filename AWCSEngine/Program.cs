using AMWUtil.PropertyFile;
using AWCSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

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
            var appProperty = PropertyFileManager.GetInstant().GetPropertyDictionary(PropertyConst.APP_KEY);

            AMWUtil.Logger.AMWLoggerManager.InitInstant(
                appProperty[PropertyConst.APP_KEY_LOG_ROOTPATH],
                appProperty[PropertyConst.APP_KEY_LOG_FILENAME]);


            Application.SetHighDpiMode(HighDpiMode.SystemAware);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new formSimulation(new VOCriteria()));
        }
    }
}
