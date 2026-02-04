export default function autoCatchFn(fn){
    return async function(req, res, next){
        try{
            await fn(req, res, next);
        }catch(err){
            next(err);
        }
    }
}