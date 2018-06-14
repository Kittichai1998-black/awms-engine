using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    public abstract class BaseEngine
    {
        protected abstract void ExecuteEngine();

        protected VOCriteria BuVO { get; set; }
        
        protected VOCriteria EngineVO { get; set; }
        protected AMWLogger Logger { get; set; }
        protected string Token => this.BuVO.GetString(BusinessVOConst.KEY_TOKEN);
        protected string TechMessage
        {
            get => this.BuVO.GetString(BusinessVOConst.KEY_TECHMESSAGE);
            set => this.BuVO.Set(BusinessVOConst.KEY_TECHMESSAGE, value);
        }

        public void Execute(AMWLogger logger,
            VOCriteria buVO,
            List<KeyGetSetCriteria> keyIns,
            List<KeyGetSetCriteria> keyOuts)
        {
            bool isExecPass = false;
            try
            {
                this.BuVO = buVO;
                this.Logger = logger;
                this.Logger.LogBegin();
                this.EngineVO = 
                    this.MappingAttrVO(EngineParamAttr.InOutType.Request, this.BuVO, keyIns);

                this.Logger.LogInfo("Input BusinessVO : " + this.BuVO.ToString());
                this.Logger.LogInfo("Begin ExecuteEngine : " + this.EngineVO.ToString());
                this.ExecuteEngine();
                this.Logger.LogInfo("End ExecuteEngine : " + this.EngineVO.ToString());
                var responseVO =
                    this.MappingAttrVO(EngineParamAttr.InOutType.Response,
                    this.EngineVO,
                    keyOuts);
                this.Logger.LogInfo("Result ResponseVO = " + responseVO.ToString());
                this.BuVO.SetRang(responseVO);
                isExecPass = true;
            }
            catch (AMWUtil.Exception.AMWException ex)
            {
                isExecPass = false;
                this.TechMessage = ex.StackTrace;
            }
            catch (System.Exception ex)
            {
                isExecPass = false;
                new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.U0000, ex.StackTrace);
            }
            finally
            {
                if (this.Logger != null)
                {
                    this.Logger.LogInfo("Output BusinessVO : " + this.BuVO.ToString());
                    this.Logger.LogEnd();
                }
            }
        }

        /*public VOCriteria MappingAttrVO2 (
            EngineParamAttr.InOutType IOType,
            VOCriteria vo,
            List<KeyGetSetCriteria> keyGetSets)
        {
            VOCriteria res = new VOCriteria();
            var attrs = AttributeUtil.ListAttributeOfType<EngineParamAttr>(this);
            foreach(var attr in attrs)
            {
                if(attr.IOType == IOType)
                {
                    string getBy = keyGetSets.FirstOrDefault(x => x.KeySet == attr.PName).KeyGet.Trim();
                    if (getBy.StartsWith("*"))
                        getBy = vo.GetDynamic(getBy.Substring(1));
                    res.Set(attr.PName, getBy);
                }
            }

            return res;
        }*/

        public VOCriteria MappingAttrVO(
            EngineParamAttr.InOutType IOType,
            VOCriteria vo,
            List<KeyGetSetCriteria> keyGetSets)
        {
            VOCriteria res = new VOCriteria();
            var constInfos = this.GetType().GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy);
            foreach (var cif in constInfos)
            {
                var attr = AttributeUtil.FirstAttributeOfType<EngineParamAttr>(cif);
                if (attr.IOType == IOType)
                {
                    string PName = (string)cif.GetValue(this);
                    string getBy = keyGetSets.FirstOrDefault(x => x.KeySet == PName).KeyGet.Trim();
                    if (getBy.StartsWith("*"))
                        getBy = vo.GetDynamic(getBy.Substring(1));
                    res.Set(PName, getBy);
                }
            }

            return res;
        }
    }
}
