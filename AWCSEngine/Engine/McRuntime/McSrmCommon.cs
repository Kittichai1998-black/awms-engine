using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McSrmCommon : BaseMcRuntime
    {
        public McSrmCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnRun()
        {
            if (this.McWork4Receive != null)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    BaseMcRuntime shuInNextLoc = null;
                    acs_Location nextLoc = null;
                    this.McWork4Receive.GetCur_TreeRoute().ForEach(x =>
                    {
                        x.Childs.ForEach(nextLocID =>
                        {
                            var _nextLoc = this.StaticValue.GetLocation(nextLocID.Value);
                            var shuInNextLocTmps = Controller.McRuntimeController.GetInstant().ListMcRuntimeByLocation(null, nextLoc.GetBay(), nextLoc.GetLv());
                            shuInNextLoc = shuInNextLocTmps.FirstOrDefault(x => x.Code.StartsWith("SHU#"));
                            if (shuInNextLoc != null)
                            {
                                nextLoc = _nextLoc;
                                return;
                            }
                        });
                    });
                    if(shuInNextLoc != null)
                    {
                        //shuInNextLoc.McObj.DV_Pre_ShtDi
                        shuInNextLoc.PostCommand(McCommandType.CM_1,
                            ListKeyValue<string, object>
                            .New("Set_SouLoc", string.Format("{0}{1:000}",nextLoc.GetBay(), nextLoc.GetLv()).Get2<int>())
                            .Add("Set_ShtDi", 1)//1 ด้านIN/ 2 ด้านOut
                            , 
                            (mc) =>
                            {
                                if(mc.EventStatus == McObjectEventStatus.IDEL)
                                {
                                }
                            });
                    }
                    //this.PostCommand(McCommandType.CM_1,0,0,1,
                }
            }
        }

        protected override bool OnRun_COMMAND()
        {
            return false;
        }

        protected override bool OnRun_DONE()
        {
            return false;
        }

        protected override bool OnRun_ERROR()
        {
            return false;
        }

        protected override bool OnRun_IDLE()
        {
            return false;
        }

        protected override bool OnRun_WORKING()
        {
            return false;
        }
    }
}
