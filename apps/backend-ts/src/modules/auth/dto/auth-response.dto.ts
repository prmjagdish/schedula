export interface AuthResponseDto {
  accessToken: string;
}

export interface JwtPayload {
  sub: string; // userId
  role: string;
}
