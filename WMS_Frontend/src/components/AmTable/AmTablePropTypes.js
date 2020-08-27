
import PropTypes from "prop-types"
const propTypes = {
    /**
    * ข้อมูลในตาราง
    * ** value : Array Object [{"a":"1", "b":"2", "c":"3"}]
    */
    dataSource: PropTypes.array.isRequired,
    /**
     * รูปแบบของหัวตารางเลือกเอกสาร
     ** value : Array Object [{"accessor":"", "Header":"", "sortable":true}]
    */
    columns: PropTypes.array.isRequired,
    /**
        * Primary Key
        ** value? : "ID"
    */
    dataKey: PropTypes.string.isRequired,
    /**
     * return style object ตามเงื่อนไขข้อมูล
     ** value? : (accessor, cellData, dataSource)=> {return {color:"red"}}
    */
    cellStyle: PropTypes.func,
    /**
     * เลือกรูปแบบ selection
     ** value? : "radio" | "checkbox"
    */
    selection: PropTypes.string,
    /**
     * เลือกรูปแบบ filterable
     ** value? : true | false
    */
    filterable: PropTypes.bool,
    /**
        * function รับค่า Filter
        ** value? : (filterData) => {}
    */
    filterData: PropTypes.func,
    /**
     * เปิดปิด row number
     ** value? : true | false
    */
    rowNumber: PropTypes.bool,
    /**
     * ความสูง grid
     ** value? : 500
    */
    height: PropTypes.number,
    /**
     * return style object
     ** value? : {color:"red"}
    */
    tableStyle: PropTypes.object,
    /**
     * return style object
     ** value? : {color:"red"}
    */
    headerStyle: PropTypes.object,
    /**
     * return style object ตามเงื่อนไขข้อมูล footer
     ** value? : (accessor, cellData, dataSource)=> {return {color:"red"}}
    */
    footerStyle: PropTypes.func,
    /**
     * return Array [Field]
     ** value? : ["ID", "Code"]
    */
    groupByData: PropTypes.array,
    /**
     * return Object ข้อมูลสำหรับ group ตาม row
     ** value? : {"field":["ID"], "sumField":["Quantity"]}
    */
    groupBy: PropTypes.object,
    /**
     * จำนวน row ขั้นต่ำ
     ** value? : 5
    */
    minRows: PropTypes.number,
    /**
     * เปิดปิดการใช้งาน pagination
     ** value? : true | false
    */
    pagination: PropTypes.bool,
    /**
     * return ข้อมูลเลขหน้าปัจจุบัน
     ** value? : (page) => {}
    */
    onPageChange: PropTypes.func,
    /**
     * ข้อมูลจำนวน row ทั้งหมด
     ** value? : 500
    */
    totalSize: PropTypes.number,
    /**
     * return ข้อมูลที่ถูกเลือก
     ** value? : (selectionValue) => {}
    */
    selectionData: PropTypes.func,
    /**
     * ข้อมูล selection เริ่มต้น
     ** value? : [{ID:1},{ID:2},...]
    */
    selectionDefault: PropTypes.array,
    /**
     * ใช้เปิดปิดเงื่อนไขเคลียข้อมูลที่เลือกเมื่อเปลี่ยนหน้า
     ** value? : true | false
    */
    clearSelectionChangePage: PropTypes.bool,
    /**
     * ใช้เปิดปิดเงื่อนไขเคลียข้อมูลที่เลือกเมื่อเปลี่ยน-hv,^]
     ** value? : true | false
    */
    clearSelectionChangeData: PropTypes.bool,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /**
     * ตั้งค่าความรูปแบบหัวตาราง
     ** value? : "100%" | 100
    */
    customTopControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customTopLeftControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customTopRightControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customBtmControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customBtmLeftControl:PropTypes.element,
    /**
     * ตั้งค่าความกว้างของตาราง
     ** value? : "100%" | 100
    */
    customBtmRightControl:PropTypes.element,
    /**
     * ตั้งค่าการเปิดปิดการ sort ทั้งตาราง
     ** value? : true | false
    */
    sortable:PropTypes.bool,
    /**
     * return ข้อมูลที่ถูกเรียง
     * value? : {"id": row.accessor,"sortDirection": SortDirection.ASC}
    */
   sortData:PropTypes.func,
   /**
    * ตั้งค่าความ Selection Disabled
    ** value? : function return boolean
   */
    selectionDisabledCustom:PropTypes.func,
    /**
     * ตั้งค่าจำนวนข้อมูลต่อตาราง
     ** value? : 50
    */
    pageSize:PropTypes.number,
    /**
     * ส่งค่าที่เปลี่ยนจำนวนข้อมูลต่อตารางกลับ
     ** value? : (pageSize) => 
    */
    onPageSizeChange:PropTypes.func,
}

export default propTypes;