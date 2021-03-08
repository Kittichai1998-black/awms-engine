using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using OPCAutomation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ADO.WCSPLC
{
    public class PlcKepwareV6ADO : BasePlcADO<PlcKepwareV6ADO>
    {
        private OPCServer OPC_ConnOPCServer { get; set; }
        private OPCGroup OPC_ConnGroups { get; set; }

        Dictionary<string,int> OPC_ItemIndexs { get; set; }
        Array OPC_ItemIDs = null;
        Array OPC_ServerHandles = null;
        Array OPC_ItemServerErrors = null;
        Array OPC_ClientHandles = null;
        Array OPC_RequestedDataTypes = null;
        Array OPC_AccessPaths = null;
        Array OPC_WriteItems = null;


        protected const string KEPWARE_PRODID = "Kepware.KEPServerEX.V6";
        public override void Open()
        {
            if (OPC_ConnOPCServer != null) return;

            var DeviceValues = new Dictionary<string, object>();
            OPC_ConnOPCServer = new OPCAutomation.OPCServer();
            OPC_ConnOPCServer.Connect(KEPWARE_PRODID, "");


            OPC_ConnGroups = OPC_ConnOPCServer.OPCGroups.Add(this.PlcDeviceName);
            OPC_ConnGroups.DataChange += new DIOPCGroupEvent_DataChangeEventHandler(ConnGroups_DataChange);
            OPC_ConnGroups.UpdateRate = 80;
            OPC_ConnGroups.IsSubscribed = OPC_ConnGroups.IsActive;
            OPC_ConnGroups.OPCItems.DefaultIsActive = true;


            var mstList = ADO.WCSDB.DataADO.GetInstant()
                .SelectBy<acs_McMaster>(
                ListKeyValue<string,object>
                    .New("PlcDeviceName", this.PlcDeviceName)
                    .Add("Status",EntityStatus.ACTIVE), null).ToList();

            var _OPCItemIDs = new List<string>(); 
            var fs = typeof(acs_McMaster).GetFields();
            foreach(var mst in mstList)
            {
                foreach (var f in fs)
                {
                    if (f.Name.StartsWith("DK_"))
                    {
                        if (f.GetValue(mst) != null &&
                            !string.IsNullOrEmpty(f.GetValue(mst).ToString()))
                        {
                            string name = this.PlcDeviceName + "." + f.GetValue(mst);
                            //name = name.ToUpper();
                            _OPCItemIDs.Add(name);
                        }
                    }
                }
            }

            _OPCItemIDs.Add(this.PlcDeviceName + ".CCONN_READ");
            _OPCItemIDs.Add(this.PlcDeviceName + ".CCONN_WRITE");

            this.OPC_ItemIndexs = new Dictionary<string, int>();
            this.OPC_ItemIDs = Array.CreateInstance(typeof(string), _OPCItemIDs.Count + 1);
            this.OPC_ServerHandles = Array.CreateInstance(typeof(Int32), _OPCItemIDs.Count + 1);
            this.OPC_ItemServerErrors = Array.CreateInstance(typeof(Int32), _OPCItemIDs.Count + 1);
            this.OPC_ClientHandles = Array.CreateInstance(typeof(Int32), _OPCItemIDs.Count + 1);
            this.OPC_RequestedDataTypes = Array.CreateInstance(typeof(Int16), _OPCItemIDs.Count + 1);
            this.OPC_AccessPaths = Array.CreateInstance(typeof(string), _OPCItemIDs.Count + 1);
            this.OPC_WriteItems = Array.CreateInstance(typeof(object), _OPCItemIDs.Count + 1);

            for (int index = 0; index < _OPCItemIDs.Count; index++)
            {
                this.OPC_ItemIndexs.Add(_OPCItemIDs[index], index + 1);
                this.OPC_ItemIDs.SetValue(_OPCItemIDs[index], index + 1);
                this.OPC_ClientHandles.SetValue(index+1, index + 1);
            }

            OPC_ConnGroups.OPCItems.AddItems(OPC_ItemIDs.Length-1, 
                ref OPC_ItemIDs,
                ref OPC_ClientHandles, 
                out OPC_ServerHandles, 
                out OPC_ItemServerErrors,
                OPC_RequestedDataTypes,
                OPC_AccessPaths);

        }
        private void ConnGroups_DataChange(int TransactionID, int NumItems, ref Array ClientHandles, ref Array ItemValues, ref Array Qualities, ref Array TimeStamps)
        {
            for(int i = 1; i <= NumItems; i++)
            {
                int index = (int)ClientHandles.GetValue(i);
                object val = ItemValues.GetValue(i);
                this.OPC_WriteItems.SetValue(val, index);
            }
        }
        public override T GetDevice<T>(string key)
        {
            object res;
            int itemIndex;
            try
            {
                itemIndex = this.OPC_ItemIndexs[this.PlcDeviceName + "." + key];
                res = this.OPC_WriteItems.GetValue(itemIndex);
                if (res == null) return default(T);
                return res.Get2<T>();
            }
            catch(Exception ex)
            {
                throw;
            };
        }

        public object _lock_set = new object();
        public override void SetDevice<T>(string key, T val)
        {
            lock (_lock_set)
            {

                string key2 = this.PlcDeviceName + "." + key;
                if (!this.OPC_ItemIndexs.ContainsKey(key2)) return;
                int deviceIndex = this.OPC_ItemIndexs[key2];
                Array _OPC_WriteItems = Array.CreateInstance(typeof(object), this.OPC_WriteItems.Length);
                _OPC_WriteItems.SetValue(val, deviceIndex);
                if (key.EndsWith("CCONN_WRITE"))
                    this.OPC_ConnGroups.SyncWrite(this.OPC_ItemIDs.Length - 1, ref this.OPC_ServerHandles, ref _OPC_WriteItems, out this.OPC_ItemServerErrors);
                else
                    this.OPC_ConnGroups.SyncWrite(this.OPC_ItemIDs.Length - 1, ref this.OPC_ServerHandles, ref _OPC_WriteItems, out this.OPC_ItemServerErrors);

            }
        }

        public override void Close()
        {
            this.OPC_ConnOPCServer.Disconnect();
        }

        public override string GetDeviceString(string key, int length)
        {
            return this.GetDevice<string>(key);
        }

        public override void SetDeviceString(string key, string val, int length)
        {
            this.SetDevice<string>(key, val);
        }
    }
}
