pipeline {
    agent any

    stages {


        stage('clean allure results'){
                    
                    steps{
                        sh '''
                            echo "Suppression du cache Allure..."
                            rm -rf allure-results
                            mkdir -p allure-results
                            echo "Dossier allure-results nettoyé avec succès"
                        '''
                    }
                }


        stage('Lancer les tests Bruno') {
            agent {
                docker {
                    image 'usebruno/cli:latest'
                    args '--entrypoint= --shm-size=2gb'
                    reuseNode true
                }
            }
            steps {
                
                
                    sh 'bru run --env-file environments/prepro.yml --reporter-junit allure-results/TEST-result.xml'
                
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

    }
}
