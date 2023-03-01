// import { Employee, PrismaClient } from "@prisma/client";
// import { ReqQuery, ResBodyEmployee, TypedRequest, TypedResponse } from "types";
// import * as Service from "../services/employee.service";

// const prisma = new PrismaClient();

// // GET /employees
// export async function get(
//   req: TypedRequest<{}, {}>,
//   res: TypedResponse<Employee[]>
// ): Promise<TypedResponse<Employee[]>> {
//   const employees = await prisma.employee.findMany();

//   return res.status(200).json({ data: employees, errors: [] });
// }

// // GET /employees/byEmail
// export async function getByEmail(
//   req: TypedRequest<{}, ResBodyEmployee>,
//   res: TypedResponse<Employee>
// ): Promise<TypedResponse<Employee>> {
//   const { email, name, role } = req.body;
//   console.log(req.body);
//   if (typeof email === "undefined" || typeof name === "undefined")
//     return res.status(400).json({
//       data: [],
//       errors: [{ message: "メールアドレスまたは、氏名が入力されておりません" }],
//     });
//   const findEmployee = await prisma.employee.findUnique({
//     where: { email },
//   });
//   if (!findEmployee) {
//     // emailで見つからなかった場合、従業員のデータを作って、それを返却する
//     if (typeof role === "undefined") {
//       const createdEmployee = await Service.createEmployee({
//         email,
//         name,
//         role: "",
//       });
//       return res.status(200).json({ data: createdEmployee, errors: [] });
//     } else {
//       const createdEmployee = await Service.createEmployee({
//         email,
//         name,
//         role,
//       });
//       return res.status(200).json({ data: createdEmployee, errors: [] });
//     }
//   }

//   if (typeof role === "undefined" || role === findEmployee.role)
//     return res.status(200).json({ data: findEmployee, errors: [] });

//   // 従業員のデータのうち、Roleの変更があったら、それを変更したうえで、returnする
//   const updatedEmployee = await Service.checkRole({
//     id: findEmployee.id,
//     role,
//   });
//   return res.status(200).json({ data: updatedEmployee, errors: [] });
// }

// // POST /employees
// export async function post(
//   req: TypedRequest<{}, ResBodyEmployee>,
//   res: TypedResponse<Employee>
// ): Promise<TypedResponse<Employee>> {
//   const { name, email, role } = req.body;

//   if (typeof name === "undefined" || typeof email === "undefined") {
//     return res.status(400).json({
//       data: [],
//       errors: [{ message: "氏名または、メールが入力されておりません" }],
//     });
//   }

//   const employee = await prisma.employee.create({
//     data: { name, email, role },
//   });
//   return res.status(200).json({ data: employee, errors: [] });
// }

// // PUT /employees/:id
// export async function update(
//   req: TypedRequest<ReqQuery, ResBodyEmployee>,
//   res: TypedResponse<Employee>
// ): Promise<TypedResponse<Employee>> {
//   const { name, email, updatedAt, role } = req.body;

//   let payloadToUpdate = {
//     name,
//     email,
//     updatedAt,
//     role,
//   };

//   if (typeof name === "undefined") delete payloadToUpdate.name;
//   if (typeof email === "undefined") delete payloadToUpdate.email;
//   if (typeof updatedAt === "undefined") delete payloadToUpdate.updatedAt;
//   if (typeof role === "undefined") delete payloadToUpdate.role;

//   if (Object.keys(payloadToUpdate).length === 0)
//     return res.status(400).json({
//       data: [],
//       errors: [
//         { message: "アップデートしたい項目を最低一つ以上入力してください" },
//       ],
//     });

//   const employee = await prisma.employee.update({
//     where: { id: parseInt(req.params.id) },
//     data: { ...payloadToUpdate },
//   });
//   return res.status(200).json({ data: employee, errors: [] });
// }

// // DELETE /employees/:id
// export async function remove(
//   req: TypedRequest<ReqQuery, {}>,
//   res: TypedResponse<Employee>
// ): Promise<TypedResponse<Employee>> {
//   const employee = await prisma.employee.delete({
//     where: { id: parseInt(req.params.id) },
//   });
//   return res.status(200).json({ data: employee, errors: [] });
// }
