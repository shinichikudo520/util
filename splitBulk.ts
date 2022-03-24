/**
 * 批量数据分割操作
 * @param limit 每次分割的数量
 * @param datas 需要批量操作的数据
 * @param cb 对分割后的数据进行处理的回调函数
 */
async function splitBulk(limit:number,datas:any[],cb:(subDatas) =>void){
    const len = datas.length;
    for (let i = 0; i < len; i+=limit) {
        const maxI = Math.min(len,i+limit);
        await cb(datas.slice(i,maxI));
    }
}