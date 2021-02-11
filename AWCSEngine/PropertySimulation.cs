using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Forms;

namespace AWCSEngine
{
    public static class PropertySimulation
    {
        public static int block_w
        {
            get
            {
                return PropertyFileManager.GetInstant()
                  .Get(PropertyConst.APP_KEY, PropertyConst.APP_KEY_form_simulation_block_w).Get<int>();
            }
        }
        public static int block_h
        {
            get
            {
                return PropertyFileManager.GetInstant()
                  .Get(PropertyConst.APP_KEY, PropertyConst.APP_KEY_form_simulation_block_h).Get<int>();
            }
        }
        public static int block_border
        {
            get
            {
                return PropertyFileManager.GetInstant()
                  .Get(PropertyConst.APP_KEY, PropertyConst.APP_KEY_form_simulation_block_border).Get<int>();
            }
        }
        public static int arrow_size
        {
            get
            {
                return PropertyFileManager.GetInstant()
                  .Get(PropertyConst.APP_KEY, PropertyConst.APP_KEY_form_simulation_arrow_size).Get<int>();
            }
        }
        public static int arrow_margin
        {
            get
            {
                return PropertyFileManager.GetInstant()
                  .Get(PropertyConst.APP_KEY, PropertyConst.APP_KEY_form_simulation_arrow_margin).Get<int>();
            }
        }
        
    }
}
