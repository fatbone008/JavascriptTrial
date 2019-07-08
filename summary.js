const got = require('got');
var _ = require('lodash');
var moment = require('moment');

const startTime = "2019-07-01 00:00:00";
const endTime = "2019-07-05 19:00:00";
const store_id = 78;
const days = moment(endTime).diff(moment(startTime), 'days') + 1;
// console.log('days:', days);

const types = [
    {type: 0, name: '全部分类'},
    {type: 18, name: '包装饮料'},
    {type: 132, name: '酒类'},
    {type: 300, name: '家庭食品'},
    {type: 78, name: '散装饮料'},
    {type: 693, name: '清洁用品'},
    {type: 177, name: '糖果'},
    {type: 732, name: '个人护理用品'},
    {type: 108, name: '奶类'},
    {type: 240, name: '零食'},
    {type: 558, name: '速食'},
    {type: 480, name: '饼干/糕点'},
    {type: 585, name: '日用品'},
    {type: 885, name: '办公图书音像'},
    {type: 528, name: '面包'},
    {type: 867, name: '通讯/数码/电脑'},
    {type: 465, name: '雪糕'}
];

let requestData = {
    endtime: endTime,
    group_id: 2,
    page: 1,
    perpage: 1000,
    product_category: 0,
    search_content: "",
    starttime: startTime,
    store_id: store_id
}

let options = {
    resolveBodyOnly: true,
    // url: "https://petrochina-data.esmart365.com/configure/v1/reports/sales_reports",
    method: "POST",
    headers: {
        "content-type": "application/json",
        "authorization": "repository eyJjbGllbnRfaWQiOiAiNDY1Zjg3YTkxYmZiOWRlMzY5ZGZiMzA2NWJjMDkyOGUzMzc0MjBmOCIsICJzYWx0IjogMC42ODYzMDMxMTk5MTM3MDE5LCAiZXhwaXJlcyI6IDE1MTU0NzE1NjQuMjEwMDc5ff5v3mH4TbPQ3ZW-AVaIUFQ="
    },
    body: JSON.stringify(requestData)
}
// 热销请求参数
let hot_requestData = {
    end_time: endTime,
    is_desc: 1,
    org_id: 2,
    ranking_by: 1,
    start_time: startTime,
    store_id: store_id,
    top_n: 10,
}
let hot_options = {
    resolveBodyOnly: true,
    method: "POST",
    headers: {
        "content-type": "application/json",
        "x-api-key": "XpF1tKUX0CatqWK6uH9UU1CkZ1TNUwnN5USWT1ka"
    },
    body: JSON.stringify(hot_requestData)
}
// 库存总数参数
let stock_requestData = {
    category: 0,
    is_desc: 0,
    org_id: 2,
    page: 1,
    per_page: 10,
    search: "",
    shop_id: store_id,
}
let stock_options = {
    resolveBodyOnly: true,
    method: "POST",
    headers: {
        "content-type": "application/json;charset=UTF-8",
        "authorization": "repository eyJjbGllbnRfaWQiOiAiNDY1Zjg3YTkxYmZiOWRlMzY5ZGZiMzA2NWJjMDkyOGUzMzc0MjBmOCIsICJzYWx0IjogMC42ODYzMDMxMTk5MTM3MDE5LCAiZXhwaXJlcyI6IDE1MTU0NzE1NjQuMjEwMDc5ff5v3mH4TbPQ3ZW-AVaIUFQ="
    },
    body: JSON.stringify(stock_requestData)
}

let Total = 0; // 全品类销售总额
let Total_Gross_Profit = 0; // 全品类毛利总额
let Total_untax = 0; // 全品类税后销售总额
let Total_Sell_Count = 0; // 销售的商品种类总数
let Total_stock = 0; // 总库存商品种类总数

let context = `恒毅便利店情况（恒毅便利店提供）
(${moment(startTime).format('YYYY年MM月DD日')}—${moment(endTime).format('YYYY年MM月DD日')})\n`;

let extracted = async function () {
    const response = await got.post('https://petrochina-data.esmart365.com/configure/v1/reports/sales_reports', options)
    // console.log('response:', JSON.parse(response.body));
    let records = JSON.parse(response.body);
    Total_Sell_Count = records.length;
    records.map(product => {
        Total += product['total'];
        Total_Gross_Profit += product['gross_profit'];
        Total_untax += product['sales_income'];
    })
    context += `销售额
销售额 ${Total.toFixed(2)}元，日均销售${(Total / days).toFixed(2)}元。`;

    for (let i = 0; i < types.length; i++) {
        const requestParams = {...requestData, product_category: types[i].type};
        const _options = {...options, body: JSON.stringify(requestParams)};
        const resInAType = await got.post('https://petrochina-data.esmart365.com/configure/v1/reports/sales_reports', _options);
        const recordsInAType = JSON.parse(resInAType.body);
        let total = 0;
        recordsInAType.map(product => {
            total += product['total'];
        })
        types[i]['total'] = total; // 单类总额
        types[i]['total_rate'] = total / Total * 100;

        /*************************************************/
        let gross_profit_total = 0
        recordsInAType.map(product => {
            gross_profit_total += product['gross_profit'];
        });
        types[i]['gross_profit_total'] = gross_profit_total; // 单类毛利总额
        types[i]['gross_rate'] = gross_profit_total / Total_Gross_Profit * 100;
        console.log(`${types[i].name}: ${types[i].total}`);
    }
};

(async () => {
    try {
        /* 计算销售总额 */
        await extracted();

        /* 单类销售额排序 */
        const sortedByTotal = _.sortBy(types, [type => -type.total]);
        // console.log('sortedByTotal:', sortedByTotal)
        context += `\n销售额排名前四位的品类分别是${sortedByTotal[1].name}（${sortedByTotal[1].total_rate.toFixed(2)}%）${sortedByTotal[2].name}（${sortedByTotal[2].total_rate.toFixed(2)}%）、${sortedByTotal[3].name}（${sortedByTotal[3].total_rate.toFixed(2)}%）、${sortedByTotal[4].name}（${sortedByTotal[4].total_rate.toFixed(2)}%），销售占比达到${(sortedByTotal[1].total_rate + sortedByTotal[2].total_rate + sortedByTotal[3].total_rate + sortedByTotal[4].total_rate).toFixed(2)}%。`

        /* 热销排行前五 */
        console.log('------------开始计算热销------------');
        const hot_res = await got.post('https://a95oyxv7s6.execute-api.cn-northwest-1.amazonaws.com.cn/proc/report/usmile/ranking/sales', hot_options);
        let ranking = JSON.parse(JSON.parse(hot_res.body));
        console.log('hot_res:', ranking);
        let concatRanking = '', rankingSum = 0
        for (let i = 1; i < 6; i++) {
            concatRanking += `${ranking['' + i]['name']} ${ranking['' + i]['amount']}，`;
            rankingSum += (+ranking['' + i]['amount'])
        }
        context += `\n其中销售额前五名的单品为${concatRanking}总计${rankingSum}元，占总销售额的${(rankingSum / Total * 100).toFixed(2)}%\n`

        /* 毛利计算 */
        context += `毛利额\n毛利额${Total_Gross_Profit.toFixed(2)}元，日均毛利${(Total_Gross_Profit / days).toFixed(2)}元，毛利率${(Total_Gross_Profit / Total_untax * 100).toFixed(2)}%`;

        /* 单类毛利排名 */
        const sortedByGross = _.sortBy(types, [type => -type.gross_profit_total]);
        // console.log('单类毛利排名', sortedByGross);
        context += `\n毛利贡献排名前四位的品类分别是${sortedByGross[1].name}（${sortedByGross[1].gross_rate.toFixed(2)}%）、${sortedByGross[2].name}（${sortedByGross[2].gross_rate.toFixed(2)}%）、${sortedByGross[3].name}（${sortedByGross[3].gross_rate.toFixed(2)}%）、${sortedByGross[4].name}（${sortedByGross[4].gross_rate.toFixed(2)}%）毛利占比达到 ${(sortedByGross[1].gross_rate + sortedByGross[2].gross_rate + sortedByGross[3].gross_rate + sortedByGross[4].gross_rate).toFixed(2)}%。`

        /* 动销率计算 */
        const stock_res = await got.post('https://petrochina-data.esmart365.com/liuyi/v1/shop/stock/pc/list', stock_options);
        Total_stock = JSON.parse(stock_res.body).data.total;
        // console.log('Total_stock:', Total_stock)

        context += `\n动销商品${Total_Sell_Count}个，商品动销率${(Total_Sell_Count / Total_stock * 100).toFixed(2)}%`

        console.log(context);
    } catch (error) {
        console.error('error:', error);
    }
})();

