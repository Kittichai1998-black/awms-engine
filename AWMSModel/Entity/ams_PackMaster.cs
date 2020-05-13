namespace AWMSModel.Entity
{
    public class ams_PackMaster : BaseEntitySTD
    {
        public long SKUMaster_ID;
        public long? PackMasterType_ID;
        public decimal? WeightKG;
        public decimal? WidthM;
        public decimal? LengthM;
        public decimal? HeightM;
        public decimal Quantity;
        public long UnitType_ID;
        public long ObjectSize_ID;
        public int Revision;
    }
}
