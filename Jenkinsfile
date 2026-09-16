pipeline {
    agent any

    environment {
        // Adapte le chemin si ta collection Bruno n'est pas à la racine du repo
        COLLECTION_DIR = 'collections/test collection'
    }

    stages {
        stage('Installer les dépendances') {
            steps {
                dir("${COLLECTION_DIR}") {
                    sh 'npm install'
                    
                }
            }
        }

        stage('Lancer les tests Bruno') {
            steps {
                dir("${COLLECTION_DIR}") {
                    sh 'npm run test:bruno'
                }
            }
        }

        stage('Convertir en résultats Allure') {
            steps {
                dir("${COLLECTION_DIR}") {
                    sh 'npm run convert:allure'
                }
            }
        }
    }

    post {
        always {
            // Nécessite le plugin Jenkins "Allure" installé (Manage Jenkins > Plugins)
            allure includeProperties: false,
                   jdk: '',
                   results: [[path: "${COLLECTION_DIR}/allure-results"]]
        }
        failure {
            echo 'Les tests Bruno ont échoué — voir le rapport Allure pour le détail.'
        }
    }
}
