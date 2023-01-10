import utils from '../../utils/utils.js';
import error from './error.js';
import matcherModule from './matcher/matcher.js';
import reporterModule from './reporter/reporter.js';

// Stryker disable next-line ObjectLiteral
const dependecies = {
  matcher: matcherModule,
  reporter: reporterModule,
};

const createExcessivesSet = ({
  ignores,
  rules,
}) => {
  const regExps = [
    ...ignores,
    ...rules,
  ];
  const entries = regExps.map((regExp) => {
    return [
      regExp,
      regExp,
    ];
  });

  return Object.fromEntries(entries);
};

const lintFs = ({
  config,
  filesystem,
  logger,
}, {
  matcher,
  reporter,
} = dependecies) => {
  return async () => {
    const [
      paths,
      pathsError,
    ] = await filesystem.paths('.');

    if (pathsError) {
      return utils.errors.wrap('lintFs', pathsError);
    }

    const [
      initedConfig,
      configError,
    ] = await config.read({
      encoding: 'utf8',
      fileName: './lint-fs.yaml',
    });

    if (configError) {
      return utils.errors.wrap('lintFs', configError);
    }

    const correct = [];
    const incorrect = [];
    const {
      mode,
      ignores,
      rules,
    } = initedConfig;
    const excessivesSet = createExcessivesSet({
      ignores,
      rules,
    });

    for (const path of paths) {
      const [
        ignoredRegExp,
        ignoredRegExpError,
      ] = matcher.isCorrect(path, ignores);

      if (ignoredRegExpError) {
        return utils.errors.wrap('lintFs', ignoredRegExpError);
      }

      delete excessivesSet[ignoredRegExp];

      if (!ignoredRegExp) {
        const [
          correctRegExp,
          correctRegExpError,
        ] = matcher.isCorrect(path, rules);

        if (correctRegExpError) {
          return utils.errors.wrap('lintFs', correctRegExpError);
        }

        delete excessivesSet[correctRegExp];

        if (correctRegExp) {
          correct.push(path);
        } else {
          incorrect.push(path);
        }
      }
    }

    const excessives = Object.keys(excessivesSet);
    const [
      , printError,
    ] = reporter.print(logger, {
      correct,
      excessives,
      incorrect,
      mode,
    });

    if (printError) {
      return utils.errors.wrap('lintFs', printError);
    }

    return error({
      excessives,
      incorrect,
    });
  };
};

export default lintFs;
