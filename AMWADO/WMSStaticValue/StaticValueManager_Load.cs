using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSStaticValue
{
    public partial class StaticValueManager
    {
        public List<amv_Feature> LoadFeature(VOCriteria buVO = null)
        {
            return this._Features = ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_Feature>("status", 1, buVO ?? new VOCriteria());
        }
        public List<ams_Config> LoadConfig(VOCriteria buVO = null)
        {
            return this._Configs = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Config>("status", 1, buVO ?? new VOCriteria());
        }
        public List<ams_ObjectSize> LoadObjectSize(VOCriteria buVO = null)
        {
            this._ObjectSizes = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_ObjectSize>("status", 1, buVO ?? new VOCriteria()));
            var subVals = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_ObjectSizeMap>("status", 1, buVO ?? new VOCriteria()));
            this._ObjectSizes.ForEach(x => x.ObjectSizeInners = subVals.FindAll(y => y.ObjectSize_ID == x.ID && _ObjectSizes.Any(z => z.ID == y.InnerObjectSize_ID)));
            return this._ObjectSizes;
        }
        public List<amv_PackUnitConvert> LoadPackUnitConvert(VOCriteria buVO = null)
        {
            return this._PackUnitConverts = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_PackUnitConvert>(new SQLConditionCriteria[] { }, buVO ?? new VOCriteria()));
        }
        public List<ams_UnitType> LoadUnitType(VOCriteria buVO = null)
        {
            return this._UnitTypes = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_UnitType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_AreaMaster> LoadAreaMaster(VOCriteria buVO = null)
        {
            return this._AreaMasters = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_AreaMasterType> LoadAreaMasterType(VOCriteria buVO = null)
        {
            return this._AreaMasterTypes = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_AreaRoute> LoadAreaRoute(VOCriteria buVO = null)
        {
            return this._AreaRoutes = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaRoute>("status", 1, buVO ?? new VOCriteria()));
        }
        /*public List<ams_AreaMasterType> LoadAreaMasterType(VOCriteria buVO = null)
        {
            return this._AreaMasterTypes = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMasterType>("status", 1, buVO ?? new VOCriteria()));
        }*/
        public List<ams_Warehouse> LoadWarehouse(VOCriteria buVO = null)
        {
            return this._Warehouses = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Warehouse>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_Branch> LoadBranch(VOCriteria buVO = null)
        {
            return this._Branchs = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Branch>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_Customer> LoadCustomer(VOCriteria buVO = null)
        {
            return this._Customers = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Customer>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_Supplier> LoadSupplier(VOCriteria buVO = null)
        {
            return this._Suppliers = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Supplier>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_PackMasterType> LoadPackMasterType(VOCriteria buVO = null)
        {
            return this._PackMasterTypes = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_APIService> LoadAPIService(VOCriteria buVO = null)
        {
            return this._APIServices = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_APIService>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_SKUMasterType> LoadSKUMasterType(VOCriteria buVO = null)
        {
            return this._SKUMasterTypes = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_TransportCar> LoadTransport(VOCriteria buVO = null)
        {
            return null;
            //return this._Transports = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Transporter>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_WaveSeqTemplate> LoadWaveSeqTemplates(VOCriteria buVO = null)
        {
            return this._WaveSeqTemplates = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_WaveSeqTemplate>("status", 1, buVO ?? new VOCriteria()));
        }
        
        public List<ams_PackMaster> LoadPackMasterEmptyPallets(VOCriteria buVO = null)
        {
            var packtype = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMasterType>("Code", "EMP", buVO ?? new VOCriteria()).FirstOrDefault();
            if (packtype != null)
            {
                this._PackMasterEmptyPallets = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("PackMasterType_ID", packtype.ID.Value,
                            SQLOperatorType.EQUALS, SQLConditionType.AND)
                      }, buVO ?? new VOCriteria()));
            }
            else
            {
                this._PackMasterEmptyPallets = new List<ams_PackMaster>();
            }
            return this._PackMasterEmptyPallets;
        }
        public List<ams_SKUMaster> LoadSKUMasterEmptyPallets(VOCriteria buVO = null)
        {
            var skutype = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMasterType>("GroupType", SKUGroupType.ESP, buVO ?? new VOCriteria()).FirstOrDefault();
            if (skutype != null)
            {
                this._SKUMasterEmptyPallets = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("SKUMasterType_ID",
                            ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMasterType>("GroupType", SKUGroupType.ESP, buVO ?? new VOCriteria()).FirstOrDefault().ID.Value,
                            SQLOperatorType.EQUALS, SQLConditionType.AND)
                      }, buVO ?? new VOCriteria()));
            }
            else
            {
                this._SKUMasterEmptyPallets = new List<ams_SKUMaster>();
            }
            return this._SKUMasterEmptyPallets;
        }
        public List<ams_BaseMasterType> LoadBaseMasterType(VOCriteria buVO = null)
        {
            return this._BaseMasterTypes = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_BaseMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_WorkerService> LoadWorkerService(VOCriteria buVO = null)
        {
            return this._WorkerService = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_WorkerService>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_ScheduleService> LoadScheduleService(VOCriteria buVO = null)
        {
            return this._ScheduleService = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_ScheduleService>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_HubService> LoadHubService(VOCriteria buVO = null)
        {
            return this._HubService = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_HubService>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_PrintForm> LoadPrintForm(VOCriteria buVO = null)
        {
            return this._PrintForm = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PrintForm>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_PrintLayout> LoadPrintLayout(VOCriteria buVO = null)
        {
            return this._PrintLayout = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PrintLayout>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_PrintField> LoadPrintField(VOCriteria buVO = null)
        {
            return this._PrintField = Enumerable.ToList(ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PrintField>("status", 1, buVO ?? new VOCriteria()));
        }
    }
}
