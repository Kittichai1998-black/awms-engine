using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.APIService;
using AWMSModel.Entity;
using AMWUtil.Exception;

namespace AWMSEngine.APIService.V2.Business
{

    public class CloseDocAPI : BaseAPIService
    {
        public CloseDocAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TReq
        {
            public List<long> docIDs;
        }

        protected override dynamic ExecuteEngineManual()
        {
            List<long> docLists = new List<long>();

            TReq reqDoc = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            reqDoc.docIDs.ForEach(doc =>
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(doc, this.BuVO);
                if (docs != null)
                {

                    if (docs.EventStatus == DocumentEventStatus.NEW)
                    {
                        //เอา error ไปเก็บไว้ใน options
                        BuVO.FinalLogDocMessage.Add(new AWMSModel.Criteria.FinalDatabaseLogCriteria.DocumentOptionMessage(
                            docs.ID.Value, null, null, "Document Eventstatus is NEW"
                        ));
                    }
                    else if (docs.EventStatus == DocumentEventStatus.WORKING)
                    {
                        this.BeginTransaction();
                        var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, new WorkedDocument.TReq() { docIDs = new List<long> { doc } });
                        this.CommitTransaction();

                        if (resWorked.Count > 0)
                        {
                            this.BeginTransaction();
                            var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, resWorked);
                            this.CommitTransaction();

                            if (resClosing.Count > 0)
                            {
                                this.BeginTransaction();
                                var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
                                docLists.AddRange(resClosed);
                                this.CommitTransaction();

                            }
                        }
                    }
                    else if (docs.EventStatus == DocumentEventStatus.WORKED)
                    {
                        this.BeginTransaction();
                        var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, new List<long> { doc });
                        this.CommitTransaction();

                        if (resClosing.Count > 0)
                        {
                            this.BeginTransaction();
                            var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
                            docLists.AddRange(resClosed);
                            this.CommitTransaction();

                        }
                    }
                    else if (docs.EventStatus == DocumentEventStatus.CLOSING)
                    {
                        this.BeginTransaction();
                        var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, new List<long> { doc });
                        docLists.AddRange(resClosed);
                        this.CommitTransaction();
                    }

                }

            });

            // var listDocDiff = reqDoc.docIDs.Except(docLists).ToList();
            //list เอกสารที่มันไม่สามารถปิดเอกสารได้
            var listDocDiff = reqDoc.docIDs.Where(x => !docLists.Contains(x)).ToList();
            if (listDocDiff != null && listDocDiff.Count() > 0)
            {
                var docCodeLists = new List<string>();

                listDocDiff.ForEach(id => {
                    var docData = ADO.DataADO.GetInstant().SelectByID<amt_Document>(id, this.BuVO);
                    docCodeLists.Add(docData.Code);
                });
                var error = string.Join('\n', docCodeLists);

                throw new AMWException(Logger, AMWExceptionCode.V2002, "เอกสารที่ไม่สามารถปิดได้ \n" + error);

            }
            else
            {
                return docLists;
            }

        }

    }
}