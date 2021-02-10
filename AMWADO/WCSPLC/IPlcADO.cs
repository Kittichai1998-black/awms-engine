﻿using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSPLC
{
    public interface IPlcADO
    {
        //public PlcCommunicationType GetPlcCommunicationType();
        public IPlcADO GetInstant(int logicalNum);
        public string GetDevicelString(string key, int length);
        public short GetDevicelShot(string key);
        public int GetDevicelInt(string key);
        public long GetDevicelLong(string key);
        public float GetDevicelFloat(string key);
        public double GetDevicelDouble(string key);

        public void SetDevicelString(string key, string value);
        public void SetDevicelShot(string key, short value);
        public void SetDevicelInt(string key, int value);
        public void SetDevicelLong(string key, long value);
        public void SetDevicelFloat(string key, float value);
        public void SetDevicelDouble(string key, double value);
    }
}