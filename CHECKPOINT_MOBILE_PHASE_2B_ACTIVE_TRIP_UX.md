# Checkpoint Mobile Fase 2B — UX da Viagem Ativa

**Data do checkpoint:** 25 de junho de 2026

## Status geral

- **Backend:** 100%
- **Mobile base:** 70%
- **Localização real foreground:** aprovada
- **Tracking automático foreground:** aprovado
- **UX da viagem ativa:** aprovada
- **Alerta silencioso profissional:** aprovado

## Funcionalidades implementadas

- Tela de viagem ativa refatorada em componentes.
- Cabeçalho de proteção.
- Card de resumo da viagem.
- Card de localização real.
- Indicador de tracking ativo.
- Exibição da última localização enviada.
- Exibição do último horário de envio.
- Timeline simples da viagem.
- Alerta silencioso com long press.
- Estado visual de alerta enviado.
- Rodapé de ações para iniciar/finalizar viagem.
- Bloqueio de ações após finalizar viagem.

## Validações concluídas

- `npm run typecheck`: OK.
- `npx expo-doctor`: OK.
- Expo Go Android: OK.
- Fluxo real testado no celular: OK.
- Tracking continuou funcionando após refatoração: OK.
- Alerta silencioso funcionou por long press: OK.
- Finalização parou tracking: OK.

## Limitações conhecidas

- Tracking ainda é apenas em primeiro plano.
- Ainda não há background location.
- Ainda não há push notification real.
- Ainda não há link público de acompanhamento.
- Ainda não há upload real de evidências.
- Ainda falta auditoria de marca para trocar XGuardiam Ride por GUARDIAM.

## Próxima fase recomendada

**Transição de marca para GUARDIAM**

A próxima fase deve focar em:

- Auditar textos visíveis com XGuardiam/XGuardiam Ride.
- Trocar primeiro nome visual do app para GUARDIAM.
- Não renomear pastas, banco, tabelas ou package técnico sem plano.
- Validar typecheck, expo-doctor, build e smoke test após alterações.
