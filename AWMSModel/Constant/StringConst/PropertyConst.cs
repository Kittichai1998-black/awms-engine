using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.StringConst
{
    public static class PropertyConst
    {
        public const string APP_FILENAME = "/app.property";
        public const string APP_KEY = "app";
        public const string APP_KEY_LOG_ROOTPATH = "logger.rootpath";
        public const string APP_KEY_LOG_FILENAME = "logger.filename";
        public const string APP_KEY_JOB_NAMES = "job.names";
        public const string APP_KEY_JOB_CRONEX = "job.{0}.cronex";
        public const string APP_KEY_JOB_CLASSNAME = "job.{0}.classname";
        public const string APP_KEY_JOB_DATA = "job.{0}.data";

        public const string APP_KEY_DBMSSQL_CONSTR = "database.mssql.connection";
        
    }
}
