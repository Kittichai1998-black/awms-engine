﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Business.Received
{
    public class RejectedGRDocument : BaseEngine<RejectedGRDocument.TDocReq, RejectedGRDocument.TDocRes>
    {

        public class TDocReq
        {
            public List<long> docIDs;
        }
        public class TDocRes
        {
            public List<amt_Document> documents;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            var docReceivs = AWMSEngine.ADO.DocumentADO.GetInstant().ListAndRelationSupper(reqVO.docIDs, this.BuVO);
            var docNotCloseds = docReceivs.Where(x => x.EventStatus != DocumentEventStatus.WORKING && x.EventStatus != DocumentEventStatus.NEW);
            if (docNotCloseds.Count() > 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "เอกสารรับเข้า '" + (string.Join(',', docNotCloseds.Select(x => x.Code).ToArray())) + "' ต้องมีสถานะ New หรือ Working เท่านั้น");

            List<SPOutSTORootCanUseCriteria> rootStos = new List<SPOutSTORootCanUseCriteria>();
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            docReceivs.ForEach(doc =>
            {
                var rtStos = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListBaseInDoc(doc.ID.Value, null, doc.DocumentType_ID, this.BuVO);

                foreach(var rt in rtStos)
                {
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(rt.rootID, null, EntityStatus.ACTIVE, StorageObjectEventStatus.REJECTED, this.BuVO);
                }

                rootStos.AddRange(rtStos);


                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, null, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                doc.DocumentItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(doc.ID.Value, this.BuVO);
                docItems.AddRange(doc.DocumentItems);
            });


            
            //var docIssues = ADO.DocumentADO.GetInstant().ListAndRelationSupper(reqVO.docIDs, this.BuVO);
            //var docNotCloseds = docIssues.Where(x => x.EventStatus != DocumentEventStatus.NEW);
            //if (docNotCloseds.Count() > 0)
            //    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "เอกสารรับเข้า '" + (string.Join(',', docNotCloseds.Select(x => x.Code).ToArray())) + "' ต้องมีสถานะ New เท่านั้น");

            //docIssues.ForEach(doc =>
            //{
            //    doc.EventStatus = DocumentEventStatus.REJECTED;
            //    doc.Status = ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, null, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);

            //});


            return new TDocRes() { documents = docReceivs };
        }
        
    }
}