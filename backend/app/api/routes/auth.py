from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbDep
from app.schemas.usuario import CadastroRequest, LoginRequest, TokenResponse, UsuarioResponse
from app.service import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/cadastro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def cadastro(data: CadastroRequest, db: DbDep):
    usuario = await auth_service.cadastrar(db, data)
    return usuario


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: DbDep):
    token, usuario = await auth_service.login(db, data)
    return TokenResponse(access_token=token, usuario=usuario)


@router.get("/me", response_model=UsuarioResponse)
async def me(current_user: CurrentUser):
    return current_user
