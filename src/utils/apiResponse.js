class ApiResponce {
constructor(statuCode, data,message="Success"){
    this.statuCode = statuCode
    this.data = null
    this.message = message
    this.success = statuCode<400
}
}