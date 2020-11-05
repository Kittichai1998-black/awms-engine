﻿using AMWUtil.Common;
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

namespace ProjectBOTHY.Engine.WorkQueue
{
    public class ClosedDocumentSendResponse : IProjectEngine<List<long>, List<long>>
    {
        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
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
                    items.Add(Newtonsoft.Json.JsonConvert.DeserializeObject<FileFormat.ItemDetail>(i.Options));
                }

                newText.details = items;
                var res = new ResponseGenerate().Execute(buVO.Logger, buVO, newText);
            });

            return reqVO;


        }
    }
}
