using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSModel.Constant.EnumConst;
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
        protected string APIKey => this.BuVO.GetString(BusinessVOConst.KEY_APIKEY);
        protected dynamic RequestParam => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST);
        protected LanguageType LanguageCode => this.BuVO.Get<LanguageType>(BusinessVOConst.KEY_LANGUAGE_CODE, LanguageType.TH);
        protected string TechMessage
        {
            get => this.BuVO.GetString(BusinessVOConst.KEY_TECHMESSAGE);
            set => this.BuVO.Set(BusinessVOConst.KEY_TECHMESSAGE, value);
        }

        protected AMWException NewAMWException(AMWExceptionCode code, params string[] parameters)
        {
            return new AMWException(this.Logger, code, parameters, (AMWException.ENLanguage)LanguageCode);
        }

        public void Execute(AMWLogger logger,
            VOCriteria buVO,
            List<KeyGetSetCriteria> keyIns = null,
            List<KeyGetSetCriteria> keyOuts = null)
        {
            this.BuVO = buVO;
            var result = this.BuVO.Get<dynamic>(BusinessVOConst.KEY_RESULT_API);
            try
            {
                this.Logger = logger;
                this.Logger.LogBegin();
                this.EngineVO = new VOCriteria();
                var requestVO = 
                    this.MappingAttrVO(EngineParamAttr.InOutType.Request,
                    this.BuVO, 
                    keyIns);
                this.EngineVO.SetRang(requestVO);

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

            }
            catch (AMWUtil.Exception.AMWException ex)
            {
                result.status = 0;
                result.code = ex.GetKKFCode();
                result.message = ex.GetKKFMessage();
                this.TechMessage = ex.StackTrace;
            }
            catch (System.Exception ex)
            {
                var e = new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.U0000, ex.StackTrace);
                result.status = 0;
                result.code = e.GetKKFCode();
                result.message = e.GetKKFMessage();
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

        public VOCriteria MappingAttrVO(
            EngineParamAttr.InOutType IOType,
            VOCriteria vo,
            List<KeyGetSetCriteria> keyGetSets)
        {
            VOCriteria res = new VOCriteria();
            if (keyGetSets == null)
                return res;
            var infos = this.GetType().GetProperties();
            foreach (var refVo in infos)
            {
                var attr = AttributeUtil.FirstAttributeOfType<EngineParamAttr>(refVo);
                if (attr != null)
                {
                    if (attr.IOType == IOType)
                    {
                        string PName = attr.PName;
                        var kgs = keyGetSets.FirstOrDefault(x => x.KeyLocalVar == PName);
                        if (kgs == null)
                            throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V0004, PName);
                        string getBy = (IOType == EngineParamAttr.InOutType.Request) ? kgs.KeyGlobalVar.Trim() : "*"+kgs.KeyLocalVar.Trim();
                        string setBy = (IOType == EngineParamAttr.InOutType.Response) ? kgs.KeyGlobalVar.Trim() :  kgs.KeyLocalVar.Trim();
                        if (getBy.StartsWith("*"))
                        {
                            string layerObject = getBy.Substring(1);
                            dynamic _getBy = vo.GetDynamic(layerObject);
                            res.Set(setBy, _getBy);
                        }
                        else
                            res.Set(setBy, getBy);
                    }
                    if (refVo.GetValue(this) == null)
                    {
                        var _refVo = Activator.CreateInstance(refVo.PropertyType, new object[] { this.EngineVO, attr.PName });
                        refVo.SetValue(this, _refVo);
                    }
                }
            }

            return res;
        }
    }
}
