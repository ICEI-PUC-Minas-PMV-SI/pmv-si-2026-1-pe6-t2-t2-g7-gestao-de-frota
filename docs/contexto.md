# Introdução

Este projeto propõe o desenvolvimento de uma aplicação distribuída para gestão de frota da empresa Unitech, organização fictícia que utiliza veículos próprios para transporte de materiais, equipamentos e colaboradores entre unidades, centros logísticos, fornecedores e clientes.

No cenário atual, empresas que dependem de frota própria enfrentam desafios relacionados ao controle operacional, custos elevados, manutenção preventiva, rastreamento de veículos e tomada de decisão baseada em dados. A ausência de um sistema integrado e centralizado pode resultar em desperdícios, falhas de comunicação, atrasos logísticos e aumento de riscos operacionais.

A proposta consiste em analisar o contexto organizacional da Unitech e estruturar uma solução tecnológica distribuída capaz de apoiar a gestão eficiente da frota, promovendo maior controle, transparência e escalabilidade dos processos.

O público-alvo do sistema inclui gestores administrativos, setor financeiro, setor de T.I, responsáveis pela manutenção, motoristas e equipe de logística da empresa.

## Problema
A Unitech é uma empresa de produção de eletrônicos que utiliza frota própria para transporte de materiais, equipamentos e colaboradores entre unidades, centros de distribuição, fornecedores e clientes. A frota não está diretamente vinculada ao processo produtivo dos eletrônicos, mas exerce papel estratégico no suporte logístico e administrativo da organização.

Atualmente, o gerenciamento dessa frota ocorre de forma descentralizada, com controles realizados por meio de planilhas, registros manuais e comunicações informais entre setores. Esse modelo gera fragmentação das informações e limita a visibilidade gerencial sobre o uso dos veículos.

Entre os principais problemas identificados no contexto atual, destacam-se:

- Ausência de um sistema centralizado para controle de disponibilidade e alocação dos veículos;
- Dificuldade no planejamento e acompanhamento de rotas para transporte de materiais e colaboradores;
- Controle ineficiente de manutenções preventivas e corretivas, aumentando o risco de indisponibilidade inesperada;
- Baixa rastreabilidade dos custos associados à frota (combustível, manutenção, depreciação, seguros e multas);
- Falta de indicadores consolidados que apoiem decisões estratégicas relacionadas à renovação da frota ou otimização de recursos;
- Comunicação pouco estruturada entre setores solicitantes, gestores de frota e motoristas.

Esse cenário impacta diretamente a eficiência logística da empresa, podendo gerar atrasos no deslocamento de equipes, dificuldades na movimentação de materiais e aumento de custos operacionais indiretos. Ainda que a frota não esteja envolvida na linha de produção dos eletrônicos, sua má gestão compromete o suporte às atividades corporativas e logísticas da organização.

O problema central, portanto, consiste na inexistência de um mecanismo integrado e estruturado que permita controle, monitoramento e análise das informações relacionadas à frota, garantindo maior confiabilidade, transparência e eficiência na gestão desses recursos.

## Objetivos

Objetivo Geral

Desenvolver uma aplicação distribuída para gestão da frota da Unitech, destinada ao controle e monitoramento do transporte de materiais, equipamentos e colaboradores, visando aumentar a eficiência logística e a confiabilidade das informações gerenciais.

Objetivos Específicos

- Modelar uma arquitetura distribuída que permita integração entre diferentes módulos do sistema (cadastro de veículos, controle de utilização, manutenção e relatórios).
- Implementar um mecanismo centralizado de registro e acompanhamento das solicitações de transporte de materiais e colaboradores entre unidades da empresa.
- Desenvolver um módulo de controle de manutenções preventivas e corretivas, permitindo planejamento e redução de indisponibilidades inesperadas.
- Estruturar o registro e a consolidação de custos operacionais da frota, possibilitando análise comparativa e apoio à tomada de decisão estratégica.
- Definir e implementar indicadores de desempenho (KPIs) relacionados à utilização, disponibilidade e custos da frota.
- Garantir requisitos não funcionais compatíveis com sistemas distribuídos, como escalabilidade, disponibilidade, segurança e integridade dos dados.

## Justificativa

A gestão de frotas corporativas constitui um elemento estratégico para organizações que dependem de deslocamento de recursos físicos e humanos para sustentar suas operações administrativas e logísticas. No contexto da Unitech, empresa do setor de produção de eletrônicos, a frota própria não está diretamente ligada à linha de produção, porém exerce papel fundamental no transporte de materiais, equipamentos e colaboradores entre unidades, fornecedores e centros de distribuição.

A ausência de um sistema estruturado e integrado para gerenciamento desses recursos pode gerar impactos indiretos significativos, como aumento de custos operacionais, falhas de planejamento logístico, indisponibilidade de veículos e dificuldade na consolidação de informações para análise gerencial. Mesmo não interferindo diretamente na fabricação dos produtos, a ineficiência no suporte logístico compromete a organização como um todo.

A escolha deste tema justifica-se tanto pela relevância prática quanto pelo potencial acadêmico. Sob a perspectiva organizacional, a proposta contribui para a melhoria da eficiência, transparência e controle dos recursos da empresa. Sob a perspectiva técnica, o projeto possibilita a aplicação de conceitos fundamentais de sistemas distribuídos, como comunicação entre serviços, sincronização de dados, tolerância a falhas, escalabilidade e segurança.

Além disso, o desenvolvimento da aplicação permite explorar boas práticas de engenharia de software, incluindo levantamento e análise de requisitos, modelagem arquitetural, definição de requisitos não funcionais e implementação orientada a serviços. Dessa forma, o trabalho integra teoria e prática, proporcionando experiência em um cenário realista e alinhado às demandas do mercado tecnológico atual.

## Público-Alvo

A aplicação será utilizada por diferentes perfis internos da Unitech, empresa do setor de produção de eletrônicos, cujas atividades envolvem transporte de materiais, equipamentos e colaboradores entre unidades. Os usuários possuem níveis distintos de familiaridade com tecnologia, diferentes responsabilidades organizacionais e variadas necessidades informacionais.

De modo geral, trata-se de um público corporativo, com experiência prévia no uso de sistemas administrativos (ERPs, planilhas eletrônicas, sistemas internos), porém com diferentes níveis de profundidade técnica. Parte dos usuários desempenha funções estratégicas e analíticas, enquanto outros atuam em nível operacional.

### Perfis de Usuários

**Gestores Administrativos**
Profissionais com visão estratégica e responsabilidade pela supervisão da frota. Possuem conhecimento intermediário em ferramentas digitais e utilizam sistemas para apoio à tomada de decisão. Valorizam relatórios consolidados, indicadores de desempenho e informações confiáveis. Exercem posição hierárquica de coordenação ou gerência.

**Setor Financeiro**
Usuários com perfil analítico, familiarizados com planilhas, relatórios e sistemas de controle orçamentário. Necessitam de dados estruturados sobre custos operacionais da frota, despesas recorrentes e projeções financeiras. Geralmente apresentam alto nível de organização e foco em precisão das informações.

**Setor de Tecnologia da Informação (TI)**
Profissionais com conhecimento técnico avançado, responsáveis por manter a infraestrutura tecnológica da empresa. Interagem com o sistema sob a perspectiva de administração, suporte, integração e segurança. Possuem elevada familiaridade com arquitetura de sistemas, redes e bancos de dados.

**Equipe de Logística**
Usuários responsáveis pelo planejamento de transporte de materiais e colaboradores. Utilizam o sistema para registrar solicitações, acompanhar disponibilidade de veículos e organizar rotas. Possuem conhecimento intermediário em tecnologia e experiência prática em operações logísticas.

**Responsáveis pela Manutenção**
Profissionais com perfil técnico-operacional, encarregados do controle de revisões, manutenções preventivas e corretivas. Podem apresentar conhecimento limitado em sistemas complexos, demandando interfaces objetivas e fluxos simplificados.

**Motoristas**
Usuários com foco operacional, responsáveis pela execução do transporte. Apresentam diferentes níveis de familiaridade com tecnologia, geralmente restrita ao uso de smartphones e aplicativos básicos. Necessitam de interfaces simples, diretas e de fácil interação.

## Personas

### Persona 1 – Gestor Administrativo

![Carlos Mendes](../docs/img/Gestao-frotas-imagens/Carlos%20Mendes.png)

---

### Persona 2 – Analista de Logística

![Mariana Souza](../docs/img/Gestao-frotas-imagens/Mariana%20Souza.png)

---

### Persona 3 – Analista de T.I

![Roberto Lima](../docs/img/Gestao-frotas-imagens/Felipe%20Andrade.png)

---

## Mapa de Stakeholders

![Roberto Lima](../docs/img/Gestao-frotas-imagens/Mapa%20Stackholders.png)


# Especificações do Projeto

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto. Para determinar a prioridade de requisitos, aplicar uma técnica de priorização de requisitos e detalhar como a técnica foi aplicada.

### Requisitos Funcionais

|ID    | Descrição do Requisito  | Prioridade |
|------|-----------------------------------------|----|
|RF-001| Permitir que o usuário cadastre tarefas | ALTA | 
|RF-002| Emitir um relatório de tarefas no mês   | MÉDIA |

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RNF-001| O sistema deve ser responsivo para rodar em um dispositivos móvel | MÉDIA | 
|RNF-002| Deve processar requisições do usuário em no máximo 3s |  BAIXA | 

Com base nas Histórias de Usuário, enumere os requisitos da sua solução. Classifique esses requisitos em dois grupos:

- [Requisitos Funcionais
 (RF)](https://pt.wikipedia.org/wiki/Requisito_funcional):
 correspondem a uma funcionalidade que deve estar presente na
  plataforma (ex: cadastro de usuário).
- [Requisitos Não Funcionais
  (RNF)](https://pt.wikipedia.org/wiki/Requisito_n%C3%A3o_funcional):
  correspondem a uma característica técnica, seja de usabilidade,
  desempenho, confiabilidade, segurança ou outro (ex: suporte a
  dispositivos iOS e Android).
Lembre-se que cada requisito deve corresponder à uma e somente uma
característica alvo da sua solução. Além disso, certifique-se de que
todos os aspectos capturados nas Histórias de Usuário foram cobertos.

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre |
|02| Não pode ser desenvolvido um módulo de backend        |

Enumere as restrições à sua solução. Lembre-se de que as restrições geralmente limitam a solução candidata.

> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)

# Catálogo de Serviços

Descreva aqui todos os serviços que serão disponibilizados pelo seu projeto, detalhando suas características e funcionalidades.

# Arquitetura da Solução

Definição de como o software é estruturado em termos dos componentes que fazem parte da solução e do ambiente de hospedagem da aplicação.

![arq](https://github.com/user-attachments/assets/b9402e05-8445-47c3-9d47-f11696e38a3d)


## Tecnologias Utilizadas

Descreva aqui qual(is) tecnologias você vai usar para resolver o seu problema, ou seja, implementar a sua solução. Liste todas as tecnologias envolvidas, linguagens a serem utilizadas, serviços web, frameworks, bibliotecas, IDEs de desenvolvimento, e ferramentas.

Apresente também uma figura explicando como as tecnologias estão relacionadas ou como uma interação do usuário com o sistema vai ser conduzida, por onde ela passa até retornar uma resposta ao usuário.

## Hospedagem

Explique como a hospedagem e o lançamento da plataforma foi feita.
