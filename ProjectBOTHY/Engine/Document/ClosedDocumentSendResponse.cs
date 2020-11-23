using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using ProjectBOTHY.Engine.FileGenerate;
using ProjectBOTHY.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Engine.Document
{
    public class ClosedDocumentSendResponse : IProjectEngine<List<long>, List<long>>
    {
        protected override List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {

            var closedDoc = new ClosedDocument();
            var resClose = closedDoc.Execute(logger, buVO, reqVO, false);

            if(resClose.Count > 0)
            {
                reqVO.ForEach(id =>
                {
                    var getDoc = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria()
                    { field = "ID", value = id, operatorType = SQLOperatorType.EQUALS }, buVO).FirstOrDefault();
                    if (getDoc != null)
                    {
                        getDoc.DocumentItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria()
                        { field = "Document_ID", value = getDoc.ID, operatorType = SQLOperatorType.EQUALS }, buVO);
                    }

                    if (!string.IsNullOrWhiteSpace(getDoc.Options))
                    {
                        var headerDetail = Newtonsoft.Json.JsonConvert.DeserializeObject<FileFormat.TextFileHeader>(ObjectUtil.QryStrGetValue(getDoc.Options, "textFile"));

                        var newText = new FileFormat.TextFileDetail();
                        newText.header = new FileFormat.TextFileHeader()
                        {
                            prefix = "START",
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
                            items.Add(Newtonsoft.Json.JsonConvert.DeserializeObject<FileFormat.ItemDetail>(ObjectUtil.QryStrGetValue(i.Options, "textFile")));
                        }

                        newText.details = items;
                        var res = new ResponseGenerate().Execute(buVO.Logger, buVO, newText);
                    }
                    
                });
            }

            return new List<long>();
        }
    }
}
