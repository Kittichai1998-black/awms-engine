﻿using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum DocumentProcessTypeID
    {
        RAW_TRANSFER_WM = 1011,
        RAW_TRANSFER_CUS = 1012,
        RAW_TRANSFER_SUP = 1013,

        WIP_TRANSFER_WM = 2011,
        WIP_TRANSFER_CUS = 2012,
        WIP_TRANSFER_SUP = 2013,

        WIP_FAST_TRANSFER_WM = 2021,
        WIP_FAST_TRANSFER_CUS = 2022,
        WIP_FAST_TRANSFER_SUP = 2023,

        WIP_CROSSDOCK_WM = 2031,
        WIP_CROSSDOCK_CUS = 2032,
        WIP_CROSSDOCK_SUP = 2033,

        WIP_PHYSICAL_COUNT_WM = 2041,
        WIP_PHYSICAL_COUNT_CUS = 2042,
        WIP_PHYSICAL_COUNT_SUP = 2043,

        WIP_CYCLE_COUNT_WM = 2051,
        WIP_CYCLE_COUNT_CUS = 2052,
        WIP_CYCLE_COUNT_SUP = 2053,

        WIP_REWORK_WM = 2061,
        WIP_REWORK_CUS = 2062,
        WIP_REWORK_SUP = 2063,

        WIP_QUALITY_CONTROL_WM = 2071,
        WIP_QUALITY_CONTROL_CUS = 2072,
        WIP_QUALITY_CONTROL_SUP = 2073,

        WIP_DELIVERY_ORDER_WM = 2081,
        WIP_DELIVERY_ORDER_CUS = 2082,
        WIP_DELIVERY_ORDER_SUP = 2083,

        WIP_RETURN_WM = 2091,
        WIP_RETURN_CUS = 2092,
        WIP_RETURN_SUP = 2093,

        WIP_CORRECTIONS_WM = 2101,
        WIP_CORRECTIONS_CUS = 2102,
        WIP_CORRECTIONS_SUP = 2103,
        WIP_PHYSICAL_COUNT_AUTO = 2181,

        FG_TRANSFER_WM = 4011,
        FG_TRANSFER_CUS = 4012,
        FG_TRANSFER_SUP = 4013,

        FG_FAST_TRANSFER_WM = 4021,
        FG_FAST_TRANSFER_CUS = 4022,
        FG_FAST_TRANSFER_SUP = 4023,

        FG_CROSSDOCK_WM = 4031,
        FG_CROSSDOCK_CUS = 4032,
        FG_CROSSDOCK_SUP = 4033,

        FG_PHYSICAL_COUNT_WM = 4041,
        FG_PHYSICAL_COUNT_CUS = 4042,
        FG_PHYSICAL_COUNT_SUP = 4043,

        FG_CYCLE_COUNT_WM = 4051,
        FG_CYCLE_COUNT_CUS = 4052,
        FG_CYCLE_COUNT_SUP = 4053,

        FG_REWORK_WM = 4061,
        FG_REWORK_CUS = 4062,
        FG_REWORK_SUP = 4063,

        FG_QUALITY_CONTROL_WM = 4071,
        FG_QUALITY_CONTROL_CUS = 4072,
        FG_QUALITY_CONTROL_SUP = 4073,

        FG_DELIVERY_ORDER_WM = 4081,
        FG_DELIVERY_ORDER_CUS = 4082,
        FG_DELIVERY_ORDER_SUP = 4083,

        FG_RETURN_WM = 4091,
        FG_RETURN_CUS = 4092,
        FG_RETURN_SUP = 4093,

        FG_CORRECTIONS_WM = 4101,
        FG_CORRECTIONS_CUS = 4102,
        FG_CORRECTIONS_SUP = 4103,

        FG_LOAD_RETURN_WM = 4111,
        FG_LOAD_RETURN_CUS = 4112,
        FG_LOAD_RETURN_SUP = 4113,

        FG_RECALL_WM = 4131,
        FG_RECALL_CUS = 4132,
        FG_RECALL_SUP = 4133,
        FG_WELFARE_WM = 4141,
        FG_DONATE_WM = 4151,
        FG_TRANSFER_EXAMPLE_WM = 4161,
        FG_TRANSFER_RD_WM = 4171,
        FG_PHYSICAL_COUNT_AUTO = 4181,

        FG_OTHER_WM = 4991,

        PM_TRANSFER_WM = 5011,
        PM_TRANSFER_CUS = 5012,
        PM_TRANSFER_SUP = 5013,
        PM_PHYSICAL_COUNT_WM = 5041,
        PM_REWORK_WM =5061,
        PM_QUALITY_CONTROL_WM = 5071, 
        PM_TRANSFER_WELFARE_WM  =5141,
        PM_TRANSFER_DONATE_WM  =  5151,
        PM_TRANSFER_EXAMPLE_WM =5161,
        PM_TRANSFER_RD_WM  =  5171,
        PM_PHYSICAL_COUNT_AUTO = 5181,
        PM_OTHER_WM=5991,

        ESP_TRANSFER_WM = 8011,
        ESP_TRANSFER_CUS = 8012,
        ESP_TRANSFER_SUP = 8013,

        ESP_FAST_TRANSFER_WM = 8021,
        ESP_FAST_TRANSFER_CUS = 8022,
        ESP_FAST_TRANSFER_SUP = 8023,

        ESP_CROSSDOCK_WM = 8031,
        ESP_CROSSDOCK_CUS = 8032,
        ESP_CROSSDOCK_SUP = 8033,

        ESP_PHYSICAL_COUNT_WM = 8041,
        ESP_PHYSICAL_COUNT_CUS = 8042,
        ESP_PHYSICAL_COUNT_SUP = 8043,

        ESP_CYCLE_COUNT_WM = 8051,
        ESP_CYCLE_COUNT_CUS = 8052,
        ESP_CYCLE_COUNT_SUP = 8053,

        ESP_REWORK_WM = 8061,
        ESP_REWORK_CUS = 8062,
        ESP_REWORK_SUP = 8063,

        ESP_QUALITY_CONTROL_WM = 8071,
        ESP_QUALITY_CONTROL_CUS = 8072,
        ESP_QUALITY_CONTROL_SUP = 8073,

        ESP_DELIVERY_ORDER_WM = 8081,
        ESP_DELIVERY_ORDER_CUS = 8082,
        ESP_DELIVERY_ORDER_SUP = 8083,

        ESP_RETURN_WM = 8091,
        ESP_RETURN_CUS = 8092,
        ESP_RETURN_SUP = 8093,

        ESP_CORRECTIONS_WM = 8101,
        ESP_CORRECTIONS_CUS = 8102,
        ESP_CORRECTIONS_SUP = 8103,

        OTH_OTHER_WM = 9991

    }
}
