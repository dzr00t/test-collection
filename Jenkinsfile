pipeline {
    agent any

    stages {
        stage('Lancer les tests Bruno') {
            agent {
                docker {
                    image 'usebruno/cli:latest'
                    // L'image a un entrypoint "bru" par défaut : on le désactive pour exécuter sh
                    args '--entrypoint= --shm-size=2gb'
                    reuseNode true
                }
            }
            steps {
                
                    sh 'bru run --env-file environments/prepro.yml --reporter-json bruno-output.json'
                
            }
        }

        stage('Convertir en résultats Allure') {
            agent {
                docker {
                    image 'node:20'
                    reuseNode true
                }
            }
            steps {
                
                    sh 'node bruno-to-allure.js bruno-output.json allure-results'
                
            }
        }
    }

    post {
        always {
            // Nécessite le plugin Jenkins "Allure" installé (Manage Jenkins > Plugins)
            allure includeProperties: false,
                   jdk: '',
                   results: [[path: "allure-results"]]
        }
        failure {
            echo 'Les tests Bruno ont échoué — voir le rapport Allure pour le détail.'
        }
    }
}
