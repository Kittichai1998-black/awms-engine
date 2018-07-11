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
    public abstract class BaseEngine<TReq, TRes>
        where TRes : class
    {

        protected abstract TRes ExecuteEngine(TReq reqVO);

        protected VOCriteria BuVO { get; set; }
        
        protected AMWLogger Logger { get; set; }
        protected string Token => this.BuVO.GetString(BusinessVOConst.KEY_TOKEN);
        protected string APIKey => this.BuVO.GetString(BusinessVOConst.KEY_APIKEY);
        protected dynamic RequestParam => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST);
        protected LanguageType LanguageCode => this.BuVO.Get<LanguageType>(BusinessVOConst.KEY_LANGUAGE_CODE, LanguageType.TH);


        protected AMWException NewAMWException(AMWExceptionCode code, params string[] parameters)
        {
            return new AMWException(this.Logger, code, parameters, (AMWException.ENLanguage)LanguageCode);
        }

        public TRes Execute(AMWLogger logger,
            VOCriteria buVO,
            TReq reqVO)
        {
            this.BuVO = buVO;
            TRes resVO = null;
            var result = this.BuVO.Get<dynamic>(BusinessVOConst.KEY_RESULT_API);
            try
            {
                this.Logger = logger;
                this.Logger.LogExecBegin("ReqVO : " + resVO.Json());
                this.Logger.LogInfo("BuVO : " + this.BuVO.ToString());
                resVO = this.ExecuteEngine(reqVO);
                this.Logger.LogSuccess("ResVO : " + resVO.Json());

            }
            catch (AMWException ex)
            {
                throw ex;
            }
            catch (System.Exception ex)
            {
                var e = new AMWException(this.Logger, AMWExceptionCode.U0000, ex.Message);
                this.Logger.LogError(ex.StackTrace);
                throw e;
            }
            finally
            {
                if (this.Logger != null)
                {
                    this.Logger.LogExecEnd("ReqVO : " + resVO.Json());
                }
            }
            return resVO;
        }

        /*public VOCriteria MappingAttrVO(
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
        }*/
    }
}
