﻿using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    public abstract class BaseEngine
    {
        protected abstract void ExecuteEngine();

        private VOCriteria BusinessVO { get; set; }

        protected VOCriteria EngineVO { get; set; }
        protected AMWLogger Logger { get; set; }
        protected string Token => this.BusinessVO.GetString(BusinessVOConst.KEY_TOKEN);
        protected string TechMessage
        {
            get => this.BusinessVO.GetString(BusinessVOConst.KEY_TECHMESSAGE);
            set => this.BusinessVO.Set(BusinessVOConst.KEY_TECHMESSAGE, value);
        }

        public void Execute(AMWLogger logger,
            VOCriteria businessVO,
            List<KeyGetSetCriteria> keyIns,
            List<KeyGetSetCriteria> keyOuts)
        {
            bool isExecPass = false;
            try
            {
                this.BusinessVO = businessVO;
                this.Logger = logger;
                this.Logger.LogBegin();
                this.EngineVO = 
                    this.MappingAttrVO(BaseEnginePrameterAttr.ParameterInOutType.Request, this.BusinessVO, keyIns);

                this.Logger.LogInfo("Input BusinessVO : " + this.BusinessVO.ToString());
                this.Logger.LogInfo("Begin ExecuteEngine : " + this.EngineVO.ToString());
                this.ExecuteEngine();
                this.Logger.LogInfo("End ExecuteEngine : " + this.EngineVO.ToString());
                var responseVO =
                    this.MappingAttrVO(BaseEnginePrameterAttr.ParameterInOutType.Response,
                    this.EngineVO,
                    keyOuts);
                this.Logger.LogInfo("Result ResponseVO = " + responseVO.ToString());
                this.BusinessVO.SetRang(responseVO);
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
                    this.Logger.LogInfo("Output BusinessVO : " + this.BusinessVO.ToString());
                    this.Logger.LogEnd();
                }
            }
        }

        public VOCriteria MappingAttrVO (
            BaseEnginePrameterAttr.ParameterInOutType IOType,
            VOCriteria vo,
            List<KeyGetSetCriteria> keyGetSets)
        {
            VOCriteria res = new VOCriteria();
            var attrs = AttributeUtil.ListAttributeOfType<BaseEnginePrameterAttr>(this);
            foreach(var attr in attrs)
            {
                if(attr.InOutType == IOType)
                {
                    string getBy = keyGetSets.FirstOrDefault(x => x.KeySet == attr.PName).KeyGet.Trim();
                    if (getBy.StartsWith("*"))
                        getBy = vo.GetDynamic(getBy.Substring(1));
                    res.Set(attr.PName, getBy);
                }
            }

            return res;
        }
        
    }
}
