using AMWUtil.Common;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using ProjectBOTHY.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Engine.WorkQueue
{
    public class ASRSProcessWorkQueueError : BaseEngine<ASRSProcessWorkQueueError.TReq, string>
    {
        public class TReq
        {
            public long docID;
        }

        protected override string ExecuteEngine(TReq reqVO)
        {
            var getDoc = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(reqVO.docID, BuVO);

            var headerDetail = Newtonsoft.Json.JsonConvert.DeserializeObject<FileFormat.TextFileHeader>(ObjectUtil.QryStrGetValue(getDoc.Options, "textFile"));

            var newText = new FileFormat.TextFileDetail();
            newText.header = new FileFormat.TextFileHeader()
            {
                prefix = headerDetail.prefix,
                command = headerDetail.command,
                commandNo = headerDetail.commandNo
            };
            newText.footer = new FileFormat.TextFileHeader()
            {
                prefix = headerDetail.prefix,
                command = headerDetail.command,
                commandNo = headerDetail.commandNo,
                rowCount = headerDetail.rowCount,
                timestamp = headerDetail.timestamp
            };

            var items = new List<FileFormat.ItemDetail>();
            foreach (var i in getDoc.DocumentItems)
            {
                var getText = AMWUtil.Common.ObjectUtil.QryStrGetValue(i.Options, "textFile");
                items.Add(Newtonsoft.Json.JsonConvert.DeserializeObject<FileFormat.ItemDetail>(getText));
            }

            newText.details = items;

            new FileGenerate.ErrorResponseGenerate().Execute(Logger, BuVO, new FileGenerate.ErrorResponseGenerate.Treq()
            {
                header = newText.header,
                details = newText.details,
                footer = newText.footer,
                error = "ไม่พบสินค้าที่ต้องการเบิก"
            });

            ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(getDoc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.REJECTED, BuVO);
            ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(getDoc.ParentDocument_ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.REJECTED, BuVO);
            return null;
        }
    }
}
