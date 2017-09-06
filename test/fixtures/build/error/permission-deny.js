export default class PermissionDeny extends Error {
  constructor (message) {
    super(message)

    this.name = 'PermissionDeny'
    this.status = 403
    this.code = 'PERMISSION_DENY'
  }
}
