import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import { departments, subjects } from '../db/schema';
import {db} from '../db';

const router = express.Router();
// get all subjects with optional search, filtering and pagination
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
        const {search, department, page = 1, limit = 10} = req.query;
        const currentPage = Math.max(1, +page);
        const limitPerPage = Math.max(1, +limit);

        const offset = (currentPage - 1) * limitPerPage;
        const filterconditions =[


        ]

        if (search){
            filterconditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                    
                )
            );
        }
      if (department){
          filterconditions.push(ilike(departments.name, `%${department}%`))
      }
      const whereClause = filterconditions.length > 0 ? and(...filterconditions): undefined;
      const countResult=await db
          .select({count:sql<number>`count(*)`})
          .from(subjects)
          .leftJoin(departments, eq(subjects.departmentId, departments.id))
          .where(whereClause);
      const totalCount = countResult[0]?.count || 0;
      const subjectsList = await db
          .select({...getTableColumns(subjects),
              department: {...getTableColumns(departments)}
          }
          ).from(subjects)
          .leftJoin(departments, eq(subjects.departmentId, departments.id))
          .where(whereClause)
          .orderBy(desc(subjects.name))
          .offset(offset)
          .limit(limitPerPage);
      res.status(200).json({
          data: subjectsList,
          pagination: {
              page: currentPage,
              limit: limitPerPage,
              total: totalCount,
              totalPages: Math.ceil(totalCount / limitPerPage)
          }
      });
  }
  catch (e){
      console.error(`GET /subjects error: ${e}`);
      res.status(500).json({error: 'Failed to fetch subjects'});
  }
});
export default router;
