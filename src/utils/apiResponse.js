class ApiResponce {
constructor(statuCode, data,message="Success"){
    this.statuCode = statuCode
    this.data = data
    this.message = message
    this.success = statuCode<400
}
}
export {ApiResponce}