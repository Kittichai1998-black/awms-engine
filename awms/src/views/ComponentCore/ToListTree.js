export default  function ToListTree(obj,fname){
    var res = [];
    res.push(obj);
    if(obj[fname] && obj[fname].length > 0)
    {
     obj[fname].forEach(x=>{
      res = res.concat(ToListTree(x,fname));
     });
    }
    return res;
   }
   