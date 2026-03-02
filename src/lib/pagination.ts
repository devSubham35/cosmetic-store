import { Model, FilterQuery, SortOrder } from "mongoose";
import { connectDB } from "@/lib/db";

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  meta: PaginatedMeta;
  data: T[];
}

export interface PaginateOptions<T> {
  model: Model<T>;
  filter?: FilterQuery<T>;
  sort?: Record<string, SortOrder>;
  projection?: Record<string, 0 | 1>;
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export async function paginate<T>({
  model,
  filter = {},
  sort = { createdAt: -1 },
  projection,
  page = 1,
  limit = 10,
  maxLimit = 100,
}: PaginateOptions<T>): Promise<PaginatedResponse<T>> {
  await connectDB();

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const skip = (safePage - 1) * safeLimit;

  const [data, total] = await Promise.all([
    model
      .find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
    data: data as T[],
  };
}

export function parsePaginationParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
    search: searchParams.get("search")?.trim() || "",
  };
}
