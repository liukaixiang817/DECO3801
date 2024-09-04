import { rest } from 'msw/lib/handlers/rest'; // 使用具体路径来导入 rest

export const handlers = [
    rest.get('/profiles', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([{ username: 'John Doe', email: 'john.doe@example.com', weekly_limit: '14 drinks' }])
        );
    }),
    // 你可以根据需要添加其他的API模拟
];
