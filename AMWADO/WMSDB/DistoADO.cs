using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class DistoADO : BaseWMSDB<DistoADO>
    {
        public List<amt_DocumentItemStorageObject> List_bySouWaveSeq_bySouSto(long souWaveSeqID, long souStoID, VOCriteria buVO)
        {
            List<amt_DocumentItemStorageObject> distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
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
            List<amt_DocumentItemStorageObject> distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Des_WaveSeq_ID", desWaveSeqID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Des_StorageObject_ID", desStoID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return distos;
        }


        public List<amt_DocumentItemStorageObject> Insert(List<amt_DocumentItemStorageObject> docItemSto, VOCriteria buVO)
        {
            docItemSto.ForEach(x => Insert(x, buVO));
            return docItemSto;
        }
        public amt_DocumentItemStorageObject Insert(amt_DocumentItemStorageObject disto, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = this.CreateDynamicParameters(disto, "ID", "IsLastSeq", "DocumentType_ID", "CreateBy", "CreateTime", "ModifyBy", "ModifyTime");
            param.Add("@actionBy", buVO.ActionBy);
            param.Add("@resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            this.Execute("SP_DISTO_PUT",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
            disto.ID = param.Get<long>("@resID");
            return disto;
        }

        public long Update(long disto_id, EntityStatus status, VOCriteria buVO)
        {
            return Update(new amt_DocumentItemStorageObject() { ID = disto_id, Status = status }, buVO);
        }
        public long Update(long disto_id, long workQueueID, EntityStatus status, VOCriteria buVO)
        {
            return Update(new amt_DocumentItemStorageObject() { ID = disto_id, WorkQueue_ID = workQueueID, Status = status }, buVO);
        }
        public long Update(long disto_id, long? des_StorageObjectID, decimal? qty, decimal? baseQty, EntityStatus status, VOCriteria buVO)
        {
            return Update(new amt_DocumentItemStorageObject()
            {
                ID = disto_id,
                Des_StorageObject_ID = des_StorageObjectID,
                Quantity = qty,
                BaseQuantity = baseQty,
                Status = status
            }, buVO);
        }
        public long Update(amt_DocumentItemStorageObject disto, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = this.CreateDynamicParameters(disto, "IsLastSeq", "DocumentType_ID", "CreateBy", "CreateTime", "ModifyBy", "ModifyTime");
            param.Add("@actionBy", buVO.ActionBy);
            param.Add("@resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            this.Execute("SP_DISTO_PUT",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
            disto.ID = param.Get<long>("@resID");
            return disto.ID.Value;
        }
        public amt_DocumentItemStorageObject Get(long ID, VOCriteria buVO)
        {
            var distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", ID, SQLOperatorType.EQUALS),
                }, buVO).FirstOrDefault();
            return distos;
        }

        public List<amt_DocumentItemStorageObject> GetListDisto(List<long> ID, VOCriteria buVO)
        {
            var distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", string.Join(',', ID), SQLOperatorType.IN),
                }, buVO);
            return distos;
        }

        public List<amt_DocumentItemStorageObject> ListBySouWaveSeq(long souWaveSeqID, VOCriteria buVO)
        {
            List<amt_DocumentItemStorageObject> distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Sou_WaveSeq_ID", souWaveSeqID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return distos;
        }
        public List<amt_DocumentItemStorageObject> ListByDesWaveSeq(long desWaveSeqID, VOCriteria buVO)
        {
            List<amt_DocumentItemStorageObject> distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Des_WaveSeq_ID", desWaveSeqID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return distos;
        }
    }
}
