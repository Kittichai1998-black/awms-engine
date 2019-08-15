export default function ToListTree(obj, fname) {
    if (obj === null) {
        return null
    } else {
        var res = [];
        res.push(obj);
        if (obj[fname] && obj[fname].length > 0) {
            obj[fname].forEach(x => {
                res = res.concat(ToListTree(x, fname));
            });
        }
        return res;
    }
}