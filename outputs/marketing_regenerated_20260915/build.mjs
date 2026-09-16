import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const dir='D:/Thunderobot/GitHub/qjdyfht/outputs/marketing_regenerated_20260915';
const source='D:/Thunderobot/GitHub/qjdyfht/outputs/marketing_activity_export_20260910/营销活动真实数据导出_接口中文表头_含玩法分类_剔除X元Y件_20260910.xlsx';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
if(process.argv.includes('--inspect')){
 console.log((await wb.inspect({kind:'sheet',include:'id,name',maxChars:2000})).ndjson);
 const p=await wb.render({sheetName:'活动主表',range:'A1:E6',scale:1});await fs.writeFile(dir+'/before.png',new Uint8Array(await p.arrayBuffer()));
 process.exit(0);
}
const s=wb.worksheets.getItem('玩法汇总');
s.getRange('A2').values=[['营销活动全量数据（2026-09-10快照）']];
s.getRange('C17:C20').values=[['含 price_disc=1 的活动；历史分类标签，不代表全部是第二件折扣'],['购买满足条件关系的条件商品即可赠送；原始门槛字段不改写'],['正常混合配置，顾客按需选择；具体额度联动仍待确认'],['保留原始记录供排查，不生成不存在的优惠结果']];
s.getRange('A23:C28').values=[['导出说明',null,null],['本次重新整理日期','2026-09-15','未重新连接数据库刷新'],['数据范围','全部1382个活动','仅剔除X元Y件（任选），不按有效期或givenum筛选'],['分类说明','沿用快照分类','分析标签不是数据库枚举；混合活动详查商品明细'],['原始数据','三表原值保持不变','异常活动也保留，以便核查；不代表可上线活动'],['待确认','resprice与数量联动','givenum=0、重复次数及条件权益映射仍待确认']];
s.getRange('A30:C40').values=[['givenum','定义/统计范围','活动数（givetype=1）'],[99999,'按赠送份数任选赠品',207],[88882,'赠送零售中最低售价赠品',1],[1,'赠送任意1个',431],[2,'赠送任意2个',16],[3,'赠送任意3个',54],[4,'赠送任意4个',2],[5,'赠送任意5个',4],[6,'赠送任意6个',2],[0,'含义待确认，不等于优惠明细数量为0',598],['备注','个/份与pstqty及重复次数的联动未明确',null]];
s.getRange('A1:C40').format.font={name:'Arial',size:11};
s.getRange('A1:A40').format.columnWidth=40;s.getRange('B1:B40').format.columnWidth=48;s.getRange('C1:C40').format.columnWidth=76;
s.getRange('A10:C40').format.wrapText=true;s.getRange('A10:C40').format.rowHeight=34;
for(const row of [10,23,30])s.getRange(`A${row}:C${row}`).format={fill:'#1F4E78',font:{bold:true,color:'#FFFFFF'}};
wb.worksheets.getItem('字段字典').getRange('I9').values=[['99999按赠送份数任选赠品；88882赠送零售中最低售价赠品；普通正整数N赠送任意N个；0/空值待确认。与pstqty及重复次数联动待确认。']];
const q=wb.worksheets.getItem('查询SQL');
q.getRange('A14:D14').values=[['补充查询','givenum=0','排除X元Y件（任选）；查询当前数据库，不代表本工作簿已刷新',"SELECT * FROM erp_marketing_full_reduction_gift WHERE givenum=0 AND (marketing_type IS NULL OR marketing_type <> 'X元Y件（任选）') ORDER BY id;"]];
q.getRange('A15:D15').values=[['口径说明','历史分玩法SQL','原SQL按快照分类保留；混合配置正常，折扣标签不是第N件结算判断','原SQL的分类是分析规则，不替代ERP正式条件与权益映射。']];
q.getRange('A14:D15').format.wrapText=true;q.getRange('A14:D15').format.rowHeight=75;
// Identifiers are text; retain all other original source cell values.
const a=wb.worksheets.getItem('活动主表');const nums=a.getRange('B2:B1383').values;
a.getRange('B2:B1383').values=nums.map(r=>[r[0]==null?null:Number(r[0])]);a.getRange('B2:B1383').setNumberFormat('0');
a.getRange('B1:B1383').format.columnWidth=26;
for(const name of ['条件明细','商品明细'])wb.worksheets.getItem(name).getUsedRange().format.rowHeight=24;
wb.recalculate();
console.log((await wb.inspect({kind:'region',sheetId:'玩法汇总',range:'A30:C40',maxChars:1600,tableMaxRows:11})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?',options:{useRegex:true,maxResults:10},maxChars:1000})).ndjson);
for(const name of ['玩法汇总','活动主表','条件明细','商品明细','字段字典','查询SQL']){
 const p=await wb.render({sheetName:name,range:name==='玩法汇总'?'A10:C20':name==='查询SQL'?'A1:C4':name==='字段字典'?'A1:D5':'A1:F5',scale:1});
 await fs.writeFile(dir+'/'+name+'.png',new Uint8Array(await p.arrayBuffer()));
}
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(dir+'/营销活动全量导出_中文字段_含玩法及SQL_快照20260910.xlsx');
console.log('EXPORTED');
