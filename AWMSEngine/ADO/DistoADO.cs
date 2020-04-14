using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class DistoADO : BaseMSSQLAccess<DistoADO>
    {
        public List<amt_DocumentItemStorageObject> List_bySouWaveSeq_bySouSto(long souWaveSeqID, long souStoID, VOCriteria buVO)
        {
            List<amt_DocumentItemStorageObject> distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Sou_WaveSeq_ID", souWaveSeqID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Sou_StorageObject_ID", souStoID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return distos;
        }
        public List<amt_DocumentItemStorageObject> List_byDesWaveSeq_byDesSto(long desWaveSeqID, long desStoID, VOCriteria buVO)
        {
            List<amt_DocumentItemStorageObject> distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Des_WaveSeq_ID", desWaveSeqID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Des_StorageObject_ID", desStoID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return distos;
        }
        public amt_DocumentItemStorageObject Create(amt_DocumentItemStorageObject disto, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@documentItemID", disto.DocumentItem_ID);
            param.Add("@sou_storageObjectID", disto.Sou_StorageObject_ID);
            param.Add("@sou_WaveSeqID", disto.Sou_WaveSeq_ID);
            param.Add("@des_storageObjectID", disto.Des_StorageObject_ID);
            param.Add("@des_WaveSeqID", disto.Des_WaveSeq_ID);
            param.Add("@workqueue_id", disto.WorkQueue_ID);
            param.Add("@qty", disto.Quantity);
            param.Add("@unitID", disto.UnitType_ID);
            param.Add("@baseQty", disto.BaseQuantity);
            param.Add("@baseUnitID", disto.BaseUnitType_ID);
            param.Add("@actionBy", buVO.ActionBy);
            param.Add("@resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            this.Execute("SP_DISTO_PUT",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
            disto.ID = param.Get<long>("@resID");
            return disto;
        }
        public amt_DocumentItemStorageObject Update(amt_DocumentItemStorageObject disto, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@id", disto.ID);
            param.Add("@documentItemID", disto.DocumentItem_ID);
            param.Add("@sou_storageObjectID", disto.Sou_StorageObject_ID);
            param.Add("@sou_WaveSeqID", disto.Sou_WaveSeq_ID);
            param.Add("@des_storageObjectID", disto.Des_StorageObject_ID);
            param.Add("@des_WaveSeqID", disto.Des_WaveSeq_ID);
            param.Add("@workqueue_id", disto.WorkQueue_ID);
            param.Add("@qty", disto.Quantity);
            param.Add("@unitID", disto.UnitType_ID);
            param.Add("@baseQty", disto.BaseQuantity);
            param.Add("@baseUnitID", disto.BaseUnitType_ID);
            param.Add("@actionBy", buVO.ActionBy);
            param.Add("@resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            this.Execute("SP_DISTO_PUT",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
            disto.ID = param.Get<long>("@resID");
            return disto;
        }
        public amt_DocumentItemStorageObject Get(long ID, VOCriteria buVO)
        {
            var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", ID, SQLOperatorType.EQUALS),
                }, buVO).FirstOrDefault();
            return distos;
        }

        public List<amt_DocumentItemStorageObject> GetListDisto(List<long> ID, VOCriteria buVO)
        {
            var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", string.Join(',', ID), SQLOperatorType.IN),
                }, buVO);
            return distos;
        }

        public List<amt_DocumentItemStorageObject> ListBySouWaveSeq(long souWaveSeqID, VOCriteria buVO)
        {
            List<amt_DocumentItemStorageObject> distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Sou_WaveSeq_ID", souWaveSeqID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return distos;
        }
        public List<amt_DocumentItemStorageObject> ListByDesWaveSeq(long desWaveSeqID, VOCriteria buVO)
        {
            List<amt_DocumentItemStorageObject> distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Des_WaveSeq_ID", desWaveSeqID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return distos;
        }
    }
}
