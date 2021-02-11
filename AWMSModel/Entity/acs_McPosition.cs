
using AMSModel.Constant.EnumConst;

namespace AMSModel.Entity
{
    public class acs_McPosition : BaseEntitySTD
    {
        public string GroupCode;
        public McPositionGroupType GroupType;
        public int McBuffer;
        public int DrawPosX;
        public int DrawPosY;
    }
}
