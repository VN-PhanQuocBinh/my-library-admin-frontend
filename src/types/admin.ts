export type Admin = {
  _id: string
  email: string
  fullname: string
  phoneNumber: string
  address: string
  duty: 'staff' | 'manager'
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}
