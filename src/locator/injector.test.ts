import { injector } from "./injector";



jest.mock('./jwtService', () => ({
    JWTService: jest.fn().mockImplementation(() => ({
        generateToken: jest.fn().mockReturnValue('mock_token'),
        verifyToken: jest.fn().mockReturnValue({ userId: 123 }),
    })),
}));

test('JWTService works correctly', () => {
    const jwtService = injector.jwtService;

    const token = jwtService.generateAccessToken({ userId: 123 });
    expect(token).toBe('mock_token');

    const payload = jwtService.verifyToken(token);
    expect(payload).toEqual({ userId: 123 });
});
